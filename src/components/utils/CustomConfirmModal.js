import React from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const CustomConfirmModal = ({ 
    visible, 
    onCancel, 
    onConfirm, 
    title = "Xác nhận", 
    content = "Bạn có chắc chắn muốn thực hiện hành động này?",
    okText = "Xác nhận",
    cancelText = "Hủy",
    okType = "primary",
    loading = false
}) => {
    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '18px' }} />
                    <span>{title}</span>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} disabled={loading}>
                    {cancelText}
                </Button>,
                <Button 
                    key="confirm" 
                    type={okType} 
                    danger={okType === 'danger'}
                    loading={loading}
                    onClick={onConfirm}
                >
                    {okText}
                </Button>
            ]}
            centered
            maskClosable={false}
            closable={!loading}
            style={{
                borderRadius: '8px'
            }}
        >
            <div style={{ padding: '16px 0' }}>
                {content}
            </div>
        </Modal>
    );
};

export default CustomConfirmModal;

