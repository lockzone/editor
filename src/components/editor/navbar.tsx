import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DESIGN_RESIZE,
  HISTORY_UNDO,
  HISTORY_REDO,
  dispatcher,
  useEditorState,
} from '@designcombo/core';
import logoDark from '@/assets/logo-dark.png';
import { Icons } from '../shared/icons';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, Download } from 'lucide-react';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { download } from '@/utils/download';

const baseUrl = 'https://back.civersia.com';
// const baseUrl = 'https://renderer.designcombo.dev';
//  https://renderer.designcombo.dev/status/{id}
export default function Navbar() {
  const handleUndo = () => {
    dispatcher.dispatch(HISTORY_UNDO);
  };

  const handleRedo = () => {
    dispatcher.dispatch(HISTORY_REDO);
  };

  const openLink = (url: string) => {
    window.open(url, '_blank'); // '_blank' will open the link in a new tab
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr 320px',
      }}
      className="h-[72px] absolute top-0 left-0 right-0  px-2 z-[205] pointer-events-none flex items-center"
    >
      <div className="flex items-center gap-2 pointer-events-auto h-14">
        <div className="bg-zinc-950 h-12 w-12 flex items-center justify-center rounded-md">
          <img src={logoDark} alt="logo" className="h-5 w-5" />
        </div>
        <div className="bg-zinc-950 px-1.5 h-12 flex  items-center">
          <Button
            onClick={handleUndo}
            className="text-muted-foreground"
            variant="ghost"
            size="icon"
          >
            <Icons.undo width={20} />
          </Button>
          <Button
            onClick={handleRedo}
            className="text-muted-foreground"
            variant="ghost"
            size="icon"
          >
            <Icons.redo width={20} />
          </Button>
        </div>
      </div>

      <div className="pointer-events-auto  h-14 flex items-center gap-2 justify-center">
        <div className="bg-zinc-950 px-2.5 rounded-md h-12 gap-4 flex items-center">
          <div className="font-medium text-sm px-1">Test</div>
          <ResizeVideo />
        </div>
      </div>

      <div className="flex items-center gap-2 pointer-events-auto h-14 justify-end">
        <div className="flex items-center gap-2 bg-zinc-950 px-2.5 rounded-md h-12">
          <DownloadPopover />
        </div>
      </div>
    </div>
  );
}

interface IDownloadState {
  renderId: string;
  progress: number;
  isDownloading: boolean;
}
const DownloadPopover = () => {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [downloadState, setDownloadState] = useState<IDownloadState>({
    progress: 0,
    isDownloading: false,
    renderId: '',
  });
  const {
    trackItemIds,
    trackItemsMap,
    transitionIds,
    transitionsMap,
    tracks,
    duration,
    size,
  } = useEditorState();

  const handleExport = () => {
    // Get video from player container
    const videoElement = document.querySelector('.__remotion-player') as HTMLVideoElement;
    
    if (!videoElement) {
      console.error('Could not find video element in player');
      return;
    }
    
    const targetFps = 30;
    
    const payload = {
      trackItemIds,
      trackItemsMap,
      transitionIds,
      transitionsMap,
      tracks,
      size,
      duration: duration - 750,
      fps: targetFps,
      projectId: 'main',
      videoUrl: videoElement.src
    };
  
    setDownloadState({
      ...downloadState,
      isDownloading: true,
      progress: 0
    });
  
    fetch(`${baseUrl}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    .then((res) => res.json())
    .then(({ render }) => {
      setDownloadState({
        ...downloadState,
        renderId: render.id,
        isDownloading: true,
      });
    });
  };  
    

  useEffect(() => {
    console.log('renderId', downloadState.renderId);

    let interval: NodeJS.Timeout;
    if (downloadState.renderId) {
      interval = setInterval(() => {
        fetch(`${baseUrl}/status/${downloadState.renderId}`)
          .then((res) => res.json())
          .then(({ render: { progress, output } }) => {
            if (progress === 100) {
              clearInterval(interval);
              setDownloadState({
                ...downloadState,
                renderId: '',
                progress: 0,
                isDownloading: false,
              });
              download(output, `${downloadState.renderId}`);
              setOpen(false);
            } else {
              setDownloadState({
                ...downloadState,
                progress,
                isDownloading: true,
              });
            }
          });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [downloadState.renderId]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="flex gap-1 h-8 w-8" size="icon" variant="default">
          <Download width={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 z-[250] flex flex-col gap-4">
        {downloadState.isDownloading ? (
          <>
            <Label>Downloading</Label>
            <div className="flex items-center gap-2">
              <Progress
                className="h-2 rounded-sm"
                value={downloadState.progress}
              />
              <div className="text-zinc-400 text-sm border border-border p-1 rounded-sm">
                {parseInt(downloadState.progress.toString())}%
              </div>
            </div>
            <div>
              <Button className="w-full" size="xs">
                Copy link
              </Button>
            </div>
          </>
        ) : (
          <>
            <Label>Export settings</Label>
            <Button className="w-full justify-between" variant="outline">
              <div>MP4</div>
              <ChevronDown width={16} />
            </Button>
            <div>
              <Button onClick={handleExport} className="w-full" size="xs">
                Export
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

interface ResizeOptionProps {
  label: string;
  icon: string;
  value: ResizeValue;
}

interface ResizeValue {
  width: number;
  height: number;
  name: string;
}

const RESIZE_OPTIONS: ResizeOptionProps[] = [
  {
    label: '16:9',
    icon: 'landscape',
    value: {
      width: 1920,
      height: 1080,
      name: '16:9',
    },
  },
  {
    label: '9:16',
    icon: 'portrait',
    value: {
      width: 1080,
      height: 1920,
      name: '9:16',
    },
  },
  {
    label: '1:1',
    icon: 'square',
    value: {
      width: 1080,
      height: 1080,
      name: '1:1',
    },
  },
];

const ResizeVideo = () => {
  const handleResize = (payload: ResizeValue) => {
    dispatcher.dispatch(DESIGN_RESIZE, {
      payload,
    });
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="border border-white/10"
          size="xs"
          variant="secondary"
        >
          Resize
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 z-[250]">
        <div className="grid gap-4 text-sm">
          {RESIZE_OPTIONS.map((option, index) => (
            <ResizeOption
              key={index}
              label={option.label}
              icon={option.icon}
              value={option.value}
              handleResize={handleResize}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ResizeOption = ({
  label,
  icon,
  value,
  handleResize,
}: ResizeOptionProps & { handleResize: (payload: ResizeValue) => void }) => {
  const Icon = Icons[icon];
  return (
    <div
      onClick={() => handleResize(value)}
      className="flex items-center gap-4 hover:bg-zinc-50/10 cursor-pointer"
    >
      <div className="text-muted-foreground">
        <Icon />
      </div>
      <div>
        <div>{label}</div>
        <div className="text-muted-foreground">Tiktok, Instagram</div>
      </div>
    </div>
  );
};