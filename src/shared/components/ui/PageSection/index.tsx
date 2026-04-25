/**
 * PageSection - Section wrapper component
 */
import { Card } from 'antd';
import React from 'react';

interface PageSectionProps {
  title?: React.ReactNode;
  description?: string;
  extra?: React.ReactNode;
  card?: boolean;
  children: React.ReactNode;
  className?: string;
}

const PageSection: React.FC<PageSectionProps> = ({
  title,
  description,
  extra,
  card = false,
  children,
  className = '',
}) => {
  const content = (
    <div className={`page-section ${className}`}>
      {(title || extra) && (
        <div className="page-section-header">
          {title && <h3 className="page-section-title">{title}</h3>}
          {extra && <div className="page-section-extra">{extra}</div>}
        </div>
      )}
      {description && <p className="page-section-desc">{description}</p>}
      <div className="page-section-content">{children}</div>
      <style>{`
        .page-section { margin-bottom: 24px; }
        .page-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .page-section-title { font-size: 16px; font-weight: 600; margin: 0; color: #fff; }
        .page-section-desc { color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 12px; }
        .page-section-content { margin-top: 12px; }
        .animate-in { animation-fill-mode: both; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideUp { animation: slideUp 0.5s ease-out; }
        .animate-slideLeft { animation: slideLeft 0.5s ease-out; }
        .animate-scale { animation: scale 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideLeft { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );

  if (card) {
    return <Card size="small" className={className}>{content}</Card>;
  }

  return content;
};

export default PageSection;
