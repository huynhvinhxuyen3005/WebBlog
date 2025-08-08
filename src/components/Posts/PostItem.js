import { Card, Button, Space, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import '../ style/PostItem.css';

export default function PostItem({ post, currentUser, handleDelete }) {
    const navigate = useNavigate();
    const isOwnPost = currentUser && currentUser.id === post.authorId;

    const handleEdit = () => {
        navigate(`/edit/${post.id}`);
    };

    return (
        <Card className="post-item" title={post.title} extra={post.visibility === 'private' ? <Tag color="red">Riêng tư</Tag> : <Tag color="green">Công khai</Tag>}>
            <div className="post-content-preview" dangerouslySetInnerHTML={{ __html: post.content.slice(0, 100) + '...' }} />
            <Space style={{ marginTop: 10 }}>
                <Button onClick={() => navigate(`/detail/${post.id}`)} type="primary">Xem chi tiết</Button>
                {isOwnPost && (
                    <>
                        <Button onClick={handleEdit} icon={<EditOutlined />}>Sửa</Button>
                        <Button danger onClick={() => handleDelete(post.id)} icon={<DeleteOutlined />}>Xóa</Button>
                    </>
                )}
            </Space>
        </Card>
    );
}