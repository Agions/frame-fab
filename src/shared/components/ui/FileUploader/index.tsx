/**
 * 拖放上传组件
 * 支持文件拖放上传，带有视觉反馈
 */

import { InboxOutlined } from '@ant-design/icons';
import { Upload, message } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import React, { useCallback } from 'react';

import styles from './FileUploader.module.less';

const { Dragger } = Upload;

export interface FileUploaderProps {
  /** 接受的文件类型 */
  accept?: string;
  /** 最大文件数量 */
  maxCount?: number;
  /** 最大文件大小 (MB) */
  maxSize?: number;
  /** 是否支持多文件 */
  multiple?: boolean;
  /** 上传 URL */
  action?: string;
  /** 自定义上传请求 */
  customRequest?: UploadProps['customRequest'];
  /** 文件列表 */
  fileList?: UploadProps['fileList'];
  /** 文件变化回调 */
  onChange?: (info: { file: UploadFile; fileList: UploadFile[] }) => void;

  /** 错误回调 */
  onError?: (error: Error) => void;
  /** 自定义校验 */
  beforeUpload?: (file: File, fileList: File[]) => boolean | Promise<void>;
  /** 是否禁用 */
  disabled?: boolean;
  /** 占位文本 */
  placeholder?: string;
  /** 提示文本 */
  hint?: string;
  /** 自定义样式类 */
  className?: string;
  /** 是否显示文件列表 */
  showFileList?: boolean;
  /** 是否使用拖拽模式 */
  isDragger?: boolean;
}



export const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  maxCount = 1,
  maxSize = 100,
  multiple = false,
  action,
  customRequest,
  fileList,
  onChange,
  onError,
  beforeUpload,
  disabled = false,
  placeholder = '点击或拖拽文件到此处上传',
  hint,
  className,
  showFileList = true,
  isDragger = true,
}) => {
  const handleBeforeUpload = useCallback((file: File, files: File[]) => {
    // 检查文件大小
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      message.error(`文件 ${file.name} 超过最大限制 ${maxSize}MB`);
      return false;
    }

    // 检查文件数量
    if (maxCount && files.length > maxCount) {
      message.error(`最多只能上传 ${maxCount} 个文件`);
      return false;
    }

    // 调用自定义校验
    if (beforeUpload) {
      return beforeUpload(file, files);
    }

    return true;
  }, [maxSize, maxCount, beforeUpload]);

  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'error') {
      onError?.(new Error(info.file.error?.message || '上传失败'));
    }
    onChange?.({ file: info.file, fileList: info.fileList });
  };

  const uploadProps: UploadProps = {
    accept,
    multiple,
    maxCount,
    action,
    customRequest,
    fileList,
    beforeUpload: handleBeforeUpload,
    onChange: handleChange,
    disabled,
    showUploadList: showFileList,
  };

  const renderDragger = () => (
    <Dragger
      {...uploadProps}
      className={`${styles.uploader} ${className || ''} ${disabled ? styles.disabled : ''}`}
    >
      <p className={styles.icon}>
        <InboxOutlined />
      </p>
      <p className={styles.text}>{placeholder}</p>
      {hint && <p className={styles.hint}>{hint}</p>}
    </Dragger>
  );

  const renderNormal = () => (
    <Upload
      {...uploadProps}
      className={`${styles.uploader} ${className || ''} ${disabled ? styles.disabled : ''}`}
    >
      <div className={styles.normalTrigger}>
        <InboxOutlined />
        <span>{placeholder}</span>
      </div>
    </Upload>
  );

  return isDragger ? renderDragger() : renderNormal();
};

/**
 * 图片上传组件
 */
export const ImageUploader: React.FC<Omit<FileUploaderProps, 'accept'>> = (props) => (
  <FileUploader
    accept="image/*"
    {...props}
  />
);

/**
 * 视频上传组件
 */
export const VideoUploader: React.FC<Omit<FileUploaderProps, 'accept'>> = (props) => (
  <FileUploader
    accept="video/*"
    maxSize={500}
    {...props}
  />
);

/**
 * 文档上传组件
 */
export const DocumentUploader: React.FC<Omit<FileUploaderProps, 'accept'>> = (props) => (
  <FileUploader
    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
    {...props}
  />
);

export default FileUploader;
