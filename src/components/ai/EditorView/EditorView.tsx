import AIAssistant from '../AIAssistant/AIAssistant';
import AIFeaturePanel from '../AIFeaturePanel/AIFeaturePanel';
import AssetPanel from '../AssetPanel/AssetPanel';
import Preview from '../Preview/Preview';
import PropertyPanel from '../PropertyPanel/PropertyPanel';
import Timeline from '../Timeline/Timeline';

import styles from './EditorView.module.less';

/**
 * 编辑器视图组件
 * 组合所有编辑器组件
 */
interface EditorViewProps {
  projectId?: string;
}

function EditorView({ projectId: _projectId }: EditorViewProps) {
  return (
    <div className={`flex h-full ${styles.container}`}>
      {/* 左侧资源面板 */}
      <aside className="w-[280px] flex-shrink-0 bg-background border-r border-border overflow-auto">
        <AssetPanel />
      </aside>

      {/* 主内容区域 */}
      <main className={`flex-1 flex flex-col ${styles.mainLayout}`}>
        {/* 预览区域 */}
        <section className={`flex-1 overflow-hidden ${styles.content}`}>
          <Preview />
        </section>

        {/* 时间轴 */}
        <Timeline currentTime={0} duration={0} tracks={[]} onTimeUpdate={() => {}} />
      </main>

      {/* 右侧属性面板 */}
      <aside className="w-[320px] flex-shrink-0 bg-background border-l border-border overflow-auto flex flex-col">
        <PropertyPanel />
        <AIFeaturePanel />
        <AIAssistant />
      </aside>
    </div>
  );
}

export default EditorView;
