/**
 * VideoEditorPage 子组件 - 播放器和时间轴相关
 */
import { PlayCircle, PauseCircle, Maximize, Upload } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Tooltip } from '@/shared/components/ui/tooltip';
import { Text } from '@/shared/components/ui/typography';

import styles from '../VideoEditorPage.module.less';

// ========== renderPlayerControls ==========

function renderPlayerControls(state: {
  isPlaying: boolean;
  videoSrc: string;
  currentTime: number;
  duration: number;
  togglePlayPause: () => void;
  formatTime: (s: number, opts?: object) => string;
}) {
  const { isPlaying, videoSrc, currentTime, duration, togglePlayPause, formatTime } = state;

  return (
    <div className={styles.playerControls}>
      <Button
        type="text"
        icon={isPlaying ? <PauseCircle /> : <PlayCircle />}
        onClick={togglePlayPause}
        size="large"
        disabled={!videoSrc}
      />
      <div className={styles.timeDisplay}>
        <Text>
          {formatTime(currentTime, { hours: 'always' })} /{' '}
          {formatTime(duration, { hours: 'always' })}
        </Text>
      </div>
      <div className={styles.progressBar}>
        <Progress
          percent={(currentTime / Math.max(duration, 1)) * 100}
          showInfo={false}
          strokeColor="#1E88E5"
          trailColor="#e6e6e6"
        />
      </div>
      <Tooltip title="全屏">
        <Button type="text" icon={<Maximize />} disabled={!videoSrc} />
      </Tooltip>
    </div>
  );
}

// ========== renderTimeline ==========

function renderTimeline(
  segments: { start: number; end: number }[],
  selectedSegmentIndex: number,
  currentTime: number,
  duration: number,
  onSelectSegment: (index: number) => void
) {
  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timeline}>
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`${styles.timelineSegment} ${selectedSegmentIndex === index ? styles.selected : ''}`}
            style={{
              left: `${(segment.start / Math.max(duration, 1)) * 100}%`,
              width: `${((segment.end - segment.start) / Math.max(duration, 1)) * 100}%`,
            }}
            onClick={() => onSelectSegment(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelectSegment(index);
            }}
            role="button"
            tabIndex={0}
          >
            <div className={styles.segmentHandle} />
            <div className={styles.segmentLabel}>{index + 1}</div>
            <div className={styles.segmentHandle} />
          </div>
        ))}
        <div
          className={styles.playhead}
          style={{ left: `${(currentTime / Math.max(duration, 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ========== renderVideoPlayer ==========

type UseVideoEditorState = {
  videoSrc: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  handleTimeUpdate: () => void;
  handleVideoLoaded: () => void;
  togglePlayPause: () => void;
  handleLoadVideo: () => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  formatTime: (s: number, opts?: object) => string;
};

function renderVideoPlayer(
  videoSrc: string,
  videoRef: React.RefObject<HTMLVideoElement>,
  handleTimeUpdate: () => void,
  handleVideoLoaded: () => void,
  togglePlayPause: () => void,
  state: UseVideoEditorState
) {
  if (!videoSrc) {
    return (
      <div className={styles.emptyPlayer}>
        <Button type="primary" icon={<Upload />} onClick={state.handleLoadVideo} size="large">
          加载视频
        </Button>
        <Text type="secondary" style={{ marginTop: 16 }}>
          支持MP4, MOV, AVI, MKV等格式
        </Text>
      </div>
    );
  }
  return (
    <div className={styles.playerWrapper}>
      <video
        ref={videoRef}
        src={videoSrc}
        className={styles.videoPlayer}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleVideoLoaded}
        onClick={togglePlayPause}
      >
        <track kind="captions" src="" label="Captions" default={false} />
      </video>
      {renderPlayerControls(state)}
    </div>
  );
}

export { renderPlayerControls, renderTimeline, renderVideoPlayer };
