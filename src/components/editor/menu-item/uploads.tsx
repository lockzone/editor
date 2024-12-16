import { Button } from '@/components/ui/button';
import {
  ADD_AUDIO,
  ADD_IMAGE,
  ADD_TEXT,
  ADD_VIDEO,
  dispatcher,
} from '@designcombo/core';
import { nanoid } from 'nanoid';
import { IMAGES } from '@/data/images';
import { DEFAULT_FONT } from '@/data/fonts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadIcon } from 'lucide-react';
import { useRef } from 'react';

export const Uploads = () => {

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.type.split('/')[0];
      const fileUrl = URL.createObjectURL(file);

      switch (fileType) {
        case 'image':
          dispatcher?.dispatch(ADD_IMAGE, {
            payload: {
              id: nanoid(),
              details: { src: fileUrl },
            },
            options: { trackId: 'main' },
          });
          break;
        case 'video':
          dispatcher?.dispatch(ADD_VIDEO, {
            payload: {
              id: nanoid(),
              details: { src: fileUrl },
              metadata: { resourceId: nanoid() },
            },
            options: { trackId: 'main' },
          });
          break;
        case 'audio':
          dispatcher?.dispatch(ADD_AUDIO, {
            payload: {
              id: nanoid(),
              details: { src: fileUrl },
            },
            options: {},
          });
          break;
        default:
          console.error('Unsupported file type');
      }
    }
  };

  const handleAddImage = () => {
    dispatcher?.dispatch(ADD_IMAGE, {
      payload: {
        id: nanoid(),
        details: {
          src: IMAGES[4].src,
        },
      },
      options: {
        trackId: 'main',
      },
    });
  };

  const handleAddText = () => {
    dispatcher?.dispatch(ADD_TEXT, {
      payload: {
        id: nanoid(),
        details: {
          text: 'Heading',
          fontSize: 200,
          width: 900,
          fontUrl: DEFAULT_FONT.url,
          fontFamily: DEFAULT_FONT.postScriptName,
          color: '#ffffff',
          WebkitTextStrokeColor: 'green',
          WebkitTextStrokeWidth: '20px',
          textShadow: '30px 30px 100px rgba(255, 255, 0, 1)',
          wordWrap: 'break-word',
          wordBreak: 'break-all',
        },
      },
      options: {},
    });
  };

  const handleAddAudio = () => {
    dispatcher?.dispatch(ADD_AUDIO, {
      payload: {
        id: nanoid(),
        details: {
          src: 'https://ik.imagekit.io/snapmotion/timer-voice.mp3',
        },
      },
      options: {},
    });
  };

  const handleAddVideo = () => {
    dispatcher?.dispatch(ADD_VIDEO, {
      payload: {
        id: nanoid(),
        details: {
          src: 'https://ik.imagekit.io/snapmotion/75475-556034323_medium.mp4',
        },
        metadata: {
          resourceId: '7415538a-5d61-4a81-ad79-c00689b6cc10',
        },
      },
      options: {
        trackId: 'main',
      },
    });
  };

  const handleAddVideo2 = () => {
    dispatcher?.dispatch(ADD_VIDEO, {
      payload: {
        id: nanoid(),
        details: {
          src: 'https://ik.imagekit.io/snapmotion/flat.mp4',
        },
        metadata: {
          resourceId: '7415538a-5do1-4m81-a279-c00689b6cc10',
        },
      },
    });
  };
  return (
    <div className="flex-1">
      <div className="text-md text-text-primary font-medium h-12  flex items-center px-4">
        Your media
      </div>
      <div className="px-4">
        <div>
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="projects">Project</TabsTrigger>
              <TabsTrigger value="workspace">Workspace</TabsTrigger>
            </TabsList>
            <TabsContent value="projects">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                accept="image/*,video/*,audio/*"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex gap-2 w-full"
                size="sm"
                variant="secondary"
              >
                <UploadIcon size={16} /> Upload
              </Button>
              <div></div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
