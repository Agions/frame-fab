/**
 * Timeline — 时间轴编辑器布局组件
 * ==================================
 * 组装时间轴的各个子模块。
 * 所有子组件通过 Props 传递数据，不含业务逻辑。
 */

import { TimelineToolbar } from './timeline-toolbar';
import { TimelineRuler } from './timeline-ruler';
import { TimelineTracks } from './timeline-tracks';
import { TimelinePlayhead } from './timeline-playhead';
import { TimelineClip, Track, TimelineProps } from './timeline.types';

import styles from './Timeline.module.less';

export function Timeline({ currentTime, duration, tracks, onTimeUpdate }: TimelineProps) {
  return (
    <div className={styles.timeline}>
      <TimelineToolbar duration={duration} />
      <div className={styles.timelineBody}>
        <TimelineRuler duration={duration} />
        <TimelineTracks tracks={tracks} />
        <TimelinePlayhead
          currentTime={currentTime}
          duration={duration}
          onTimeUpdate={onTimeUpdate}
        />
      </div>
    </div>
  );
}

export type { TimelineClip, Track, TimelineProps };