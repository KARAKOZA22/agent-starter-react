'use client';

import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import { useMaybeRoomContext, useMediaDeviceSelect } from '@livekit/components-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const selectVariants = cva(
  [
    'border-none pl-2 shadow-none !text-foreground',
    'bg-muted data-[state=on]:bg-muted hover:text-foreground',
    'peer-data-[state=off]/track:text-destructive peer-data-[state=off]/track:[&_svg]:!text-destructive',
    '[&_svg]:!opacity-100',
  ],
  {
    variants: {
      variant: {
        primary: [
          'text-destructive hover:text-foreground hover:bg-foreground/10 hover:data-[state=on]:bg-foreground/10',
          'dark:bg-muted dark:hover:bg-foreground/10 dark:hover:data-[state=on]:bg-foreground/10',
          '[&_svg]:!text-foreground hover:data-[state=on]:[&_svg]:!text-destructive',
        ],
        secondary: [
          'hover:bg-foreground/10 data-[state=on]:bg-blue-500/20 data-[state=on]:hover:bg-blue-500/30 data-[state=on]:text-blue-700',
          'dark:text-foreground dark:data-[state=on]:text-blue-300',
          '[&_svg]:!text-foreground',
        ],
      },
      size: {
        default: 'w-[180px]',
        sm: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

type DeviceSelectProps = React.ComponentProps<typeof SelectTrigger> &
  VariantProps<typeof selectVariants> & {
    kind: MediaDeviceKind;
    track?: LocalAudioTrack | LocalVideoTrack | undefined;
    requestPermissions?: boolean;
    onMediaDeviceError?: (error: Error) => void;
    onDeviceListChange?: (devices: MediaDeviceInfo[]) => void;
    onActiveDeviceChange?: (deviceId: string) => void;
  };

export function TrackDeviceSelect({
  kind,
  track,
  size = 'default',
  variant = 'primary',
  requestPermissions = false,
  onMediaDeviceError,
  onDeviceListChange,
  onActiveDeviceChange,
  ...props
}: DeviceSelectProps) {
  const room = useMaybeRoomContext();
  const [open, setOpen] = useState(false);
  const [requestPermissionsState, setRequestPermissionsState] = useState(requestPermissions);
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({
    room,
    kind,
    track,
    requestPermissions: requestPermissionsState,
    onError: onMediaDeviceError,
  });

  useEffect(() => {
    onDeviceListChange?.(devices);
  }, [devices, onDeviceListChange]);

  // When the select opens, ensure that media devices are re-requested in case when they were last
  // requested, permissions were not granted
  useLayoutEffect(() => {
    if (open) {
      setRequestPermissionsState(true);
    }
  }, [open]);

  const handleActiveDeviceChange = (deviceId: string) => {
    setActiveMediaDevice(deviceId);
    onActiveDeviceChange?.(deviceId);
  };

  const filteredDevices = useMemo(() => devices.filter((d) => d.deviceId !== ''), [devices]);

  if (filteredDevices.length < 2) {
    return null;
  }

  return (
    <Select
      open={open}
      value={activeDeviceId}
      onOpenChange={setOpen}
      onValueChange={handleActiveDeviceChange}
    >
      <SelectTrigger className={cn(selectVariants({ size, variant }), props.className)}>
        {size !== 'sm' && (
          <SelectValue className="font-mono text-sm" placeholder={`Select a ${kind}`} />
        )}
      </SelectTrigger>
      <SelectContent>
        {filteredDevices.map((device) => (
          <SelectItem key={device.deviceId} value={device.deviceId} className="font-mono text-xs">
            {device.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
