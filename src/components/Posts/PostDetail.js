import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Typography, Divider, List, Avatar, Button, Input, message, Tag, Space, Spin, notification } from 'antd';
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined, UserOutlined, MessageOutlined, CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import '../style/PostDetail.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function PostDetail({ currentUser }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [users, setUsers] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [postLoading, setPostLoading] = useState(true);

    useEffect(() => {
        fetchPost();
        fetchUsers();
    }, [id]);

    const showSuccessNotification = (title, content) => {
        notification.success({
            message: title,
            description: content,
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            duration: 3,
            placement: 'topRight',
            style: {
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }
        });
    };

    const fetchPost = () => {
        setPostLoading(true);
        axios.get(`http://localhost:9999/posts/${id}`)
            .then(res => setPost(res.data))
            .catch(err => {
                console.error(err);
                message.error('Không tìm thấy bài viết!');
                navigate('/');
            })
            .finally(() => setPostLoading(false));
    };

    const fetchUsers = () => {
        axios.get(`http://localhost:9999/users`)
            .then(res => setUsers(res.data))
            .catch(err => console.error(err));
    };

    const getAuthorName = (authorId) => {
        const user = users.find(u => u.id === authorId);
        return user ? user.name : 'Unknown';
    };

    const getCommentUser = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Ẩn danh';
    };

    const handleAddComment = () => {
        if (!currentUser) {
            message.error('Vui lòng đăng nhập để bình luận!');
            return;
        }

        if (!commentContent.trim()) {
            message.error('Vui lòng nhập nội dung bình luận!');
            return;
        }

        setLoading(true);
        const newComment = {
            id: Date.now().toString(),
            content: commentContent,
            userId: currentUser.id,
            createdAt: new Date().toISOString()
        };

        const updatedPost = {
            ...post,
            comments: [...post.comments, newComment]
        };

        axios.put(`http://localhost:9999/posts/${id}`, updatedPost)
            .then(() => {
                showSuccessNotification(
                    "💬 Bình luận đã được thêm!",
                    "Bình luận của bạn đã được đăng thành công."
                );
                setCommentContent('');
                fetchPost();
            })
            .catch(() => {
                message.error('Lỗi khi thêm bình luận!');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleDeleteComment = (commentId) => {
        const updatedComments = post.comments.filter(comment => comment.id !== commentId);
        const updatedPost = { ...post, comments: updatedComments };

        axios.put(`http://localhost:9999/posts/${id}`, updatedPost)
            .then(() => {
                showSuccessNotification(
                    "🗑️ Đã xóa bình luận!",
                    "Bình luận đã được xóa khỏi bài viết."
                );
                fetchPost();
            })
            .catch(() => {
                message.error('Lỗi khi xóa bình luận!');
            });
    };

    const handleDeletePost = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            axios.delete(`http://localhost:9999/posts/${id}`)
                .then(() => {
                    showSuccessNotification(
                        "🗑️ Đã xóa bài viết!",
                        "Bài viết đã được xóa khỏi hệ thống."
                    );
                    setTimeout(() => {
                        navigate('/');
                    }, 1500);
                })
                .catch(() => {
                    message.error('Lỗi khi xóa bài viết!');
                });
        }
    };

    if (postLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!post) {
        return (
            <div style={{ textAlign: 'center', padding: 40 }}>
                <Text type="secondary">Không tìm thấy bài viết</Text>
            </div>
        );
    }

    const canEdit = currentUser && post.authorId === currentUser.id;

    return (
        <div className="post-detail-container">
            <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: 16 }}>
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/')}
                        style={{ marginBottom: 16 }}
                        size="large"
                    >
                        ← Quay lại
                    </Button>
                    
                    {canEdit && (
                        <Space style={{ float: 'right' }}>
                            <Button 
                                icon={<EditOutlined />} 
                                onClick={() => navigate(`/edit/${post.id}`)}
                                size="large"
                                style={{ borderRadius: '8px' }}
                            >
                                ✏️ Sửa
                            </Button>
                            <Button 
                                icon={<DeleteOutlined />} 
                                danger
                                onClick={handleDeletePost}
                                size="large"
                                style={{ borderRadius: '8px' }}
                            >
                                🗑️ Xóa
                            </Button>
                        </Space>
                    )}
                </div>

                <Title level={2} style={{ color: '#1890ff', marginBottom: '16px' }}>
                    📝 {post.title}
                </Title>
                
                <div style={{ marginBottom: 16 }}>
                    <Space size="middle">
                        <Space size="small">
                            <Avatar size="small" icon={<UserOutlined />} />
                            <Text type="secondary">{getAuthorName(post.authorId)}</Text>
                        </Space>
                        <Text type="secondary">
                            📅 {moment(post.createdAt).format('DD/MM/YYYY HH:mm')}
                        </Text>
                        <Tag color={post.visibility === 'public' ? 'green' : 'orange'}>
                            {post.visibility === 'public' ? '🌍 Công khai' : '🔐 Riêng tư'}
                        </Tag>
                    </Space>
                </div>

                <Divider />


                <div 
                    className="post-content"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                    style={{ 
                        lineHeight: 1.8,
                        fontSize: '16px',
                        marginBottom: '24px'
                    }}
                />

                <Divider orientation="left">
                    <Space>
                        <MessageOutlined />
                        💬 Bình luận ({post.comments?.length || 0})
                    </Space>
                </Divider>

                {currentUser && (
                    <div style={{ marginBottom: 24 }}>
                        <TextArea
                            rows={3}
                            placeholder="Nhập bình luận của bạn..."
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            style={{ marginBottom: 8, borderRadius: '8px' }}
                        />
                        <Button 
                            type="primary" 
                            onClick={handleAddComment}
                            loading={loading}
                            style={{ borderRadius: '8px' }}
                        >
                            {loading ? 'Đang gửi...' : '💬 Gửi bình luận'}
                        </Button>
                    </div>
                )}

                {!currentUser && (
                    <div style={{ 
                        marginBottom: 24, 
                        padding: 16, 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                        border: 'none', 
                        borderRadius: 12,
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <Text style={{ color: 'white', fontSize: '16px' }}>
                            💡 <strong>Mẹo:</strong> Đăng nhập để bình luận bài viết này!
                        </Text>
                    </div>
                )}

                <List
                    className="comment-list"
                    dataSource={post.comments || []}
                    locale={{ emptyText: 'Chưa có bình luận nào' }}
                    renderItem={comment => (
                        <div key={comment.id} className="comment-item">
                            <Avatar style={{ backgroundColor: '#87d068' }}>
                                {getCommentUser(comment.userId)[0]}
                            </Avatar>
                            <div className="comment-content">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text strong>{getCommentUser(comment.userId)}</Text>
                                    {currentUser && (comment.userId === currentUser.id || canEdit) && (
                                        <Button 
                                            type="text" 
                                            size="small" 
                                            danger
                                            onClick={() => handleDeleteComment(comment.id)}
                                        >
                                            🗑️ Xóa
                                        </Button>
                                    )}
                                </div>
                                <div style={{ margin: '8px 0' }}>{comment.content}</div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    ⏰ {moment(comment.createdAt).fromNow()}
                                </Text>
                            </div>
                        </div>
                    )}
                />
            </Card>
        </div>
    );
}
