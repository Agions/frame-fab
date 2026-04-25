/**
 * GridStatistic - Grid display for statistics
 */
import { Row, Col } from 'antd';
import React from 'react';

interface StatItem {
  label: string;
  value: string | number;
  color?: string;
}

interface GridStatisticProps {
  items: StatItem[];
  columns?: number;
}

const GridStatistic: React.FC<GridStatisticProps> = ({ items, columns = 4 }) => {
  return (
    <Row gutter={[16, 16]}>
      {items.map((item, index) => (
        <Col key={index} span={24 / columns}>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: item.color || '#6366f1',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              {item.value}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: 'rgba(255,255,255,0.6)', 
              marginTop: '4px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {item.label}
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );
};

export default GridStatistic;
