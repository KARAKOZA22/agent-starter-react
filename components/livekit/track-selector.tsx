'use client';

import { type VariantProps } from 'class-variance-authority';
import {
  BarVisualizer,
  type TrackReferenceOrPlaceholder,
  useTrackToggle,
} from '@livekit/components-react';
import { TrackDeviceSelect } from '@/components/livekit/track-device-select';
import { TrackToggle, type toggleVariants } from '@/components/livekit/track-toggle';
import { cn } from '@/lib/utils';

interface TrackSelectorProps extends VariantProps<typeof toggleVariants> {
  kind: MediaDeviceKind;
  source: Parameters<typeof useTrackToggle>[0]['source'];
  pressed?: boolean;
  pending?: boolean;
  disabled?: boolean;
  className?: string;
  audioTrackRef?: TrackReferenceOrPlaceholder;
  onPressedChange?: (pressed: boolean) => void;
  onMediaDeviceError?: (error: Error) => void;
  onActiveDeviceChange?: (deviceId: string) => void;
}

export function TrackSelector({
  kind,
  variant,
  source,
  pressed,
  pending,
  disabled,
  className,
  audioTrackRef,
  onPressedChange,
  onMediaDeviceError,
  onActiveDeviceChange,
}: TrackSelectorProps) {
  return (
    <div className={cn('flex items-center gap-0', className)}>
      <TrackToggle
        variant={variant}
        source={source}
        pressed={pressed}
        pending={pending}
        disabled={disabled}
        onPressedChange={onPressedChange}
        className="peer/track group/track has-[.audiovisualizer]:w-auto has-[.audiovisualizer]:px-3 has-[~_button]:rounded-r-none has-[~_button]:pr-2 has-[~_button]:pl-3"
      >
        {audioTrackRef && (
          <BarVisualizer
            barCount={3}
            track={audioTrackRef}
            options={{ minHeight: 5 }}
            className="audiovisualizer flex h-6 w-auto items-center justify-center gap-0.5"
          >
            <span
              className={cn([
                'h-full w-0.5 origin-center',
                'group-data-[state=on]/track:bg-foreground group-data-[state=off]/track:bg-destructive',
                'data-lk-muted:bg-muted',
              ])}
            />
          </BarVisualizer>
        )}
      </TrackToggle>
      <TrackDeviceSelect
        size="sm"
        kind={kind}
        variant={variant}
        requestPermissions={false}
        onMediaDeviceError={onMediaDeviceError}
        onActiveDeviceChange={onActiveDeviceChange}
        className={cn([
          'relative',
          'before:bg-border before:absolute before:inset-y-0 before:-left-px before:my-2.5 before:w-px has-[~_button]:before:content-[""]',
          !pressed && 'before:bg-destructive/20',
        ])}
      />
    </div>
  );
}
