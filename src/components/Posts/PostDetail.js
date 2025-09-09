import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Card, Typography, Divider, List, Avatar, Button, Input,
    Tag, Space, Spin, Popconfirm, App
} from 'antd';
import {
    EditOutlined, DeleteOutlined, ArrowLeftOutlined, UserOutlined,
    MessageOutlined, LikeOutlined, LikeFilled
} from '@ant-design/icons';
import moment from 'moment';
import '../style/PostDetail.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function PostDetail({ currentUser }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { message, notification } = App.useApp();
    const [post, setPost] = useState(null);
    const [users, setUsers] = useState([]);
    const [likes, setLikes] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [postLoading, setPostLoading] = useState(true);

    useEffect(() => {
        fetchPost();
        fetchUsers();
        fetchLikes();
    }, [id]);

    const fetchPost = () => {
        setPostLoading(true);
        axios.get(`http://localhost:9999/posts/${id}`)
            .then(res => setPost(res.data))
            .catch(() => {
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

    const fetchLikes = () => {
        axios.get(`http://localhost:9999/likes`)
            .then(res => setLikes(res.data))
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

    const isLiked = () => {
        return currentUser && likes.some(like => like.userId === currentUser.id && like.postId === id);
    };

    const handleLike = async () => {
        if (!currentUser) {
            message.error('Vui lòng đăng nhập để like bài viết!');
            return;
        }
        const existingLike = likes.find(like => like.userId === currentUser.id && like.postId === id);

        try {
            if (existingLike) {
                // Unlike
                await axios.delete(`http://localhost:9999/likes/${existingLike.id}`);
                const updatedPost = { ...post, likesCount: Math.max(0, post.likesCount - 1) };
                await axios.put(`http://localhost:9999/posts/${id}`, updatedPost);
                setPost(updatedPost);
            } else {
                // Like
                const newLike = { id: Date.now().toString(), userId: currentUser.id, postId: id };
                await axios.post("http://localhost:9999/likes", newLike);
                const updatedPost = { ...post, likesCount: post.likesCount + 1 };
                await axios.put(`http://localhost:9999/posts/${id}`, updatedPost);
                setPost(updatedPost);
            }
            fetchLikes();
        } catch {
            message.error('Có lỗi xảy ra khi like bài viết!');
        }
    };

    const handleAddComment = () => {
        if (!currentUser) return message.error('Vui lòng đăng nhập để bình luận!');
        if (!commentContent.trim()) return message.error('Vui lòng nhập nội dung bình luận!');

        setLoading(true);
        const newComment = {
            id: Date.now().toString(),
            content: commentContent,
            userId: currentUser.id,
            createdAt: new Date().toISOString()
        };

        const updatedPost = {
            ...post,
            comments: [...(post.comments || []), newComment],
            commentsCount: (post.commentsCount || 0) + 1
        };

        axios.put(`http://localhost:9999/posts/${id}`, updatedPost)
            .then(() => {
                setCommentContent('');
                fetchPost();
            })
            .catch(() => message.error('Lỗi khi thêm bình luận!'))
            .finally(() => setLoading(false));
    };

    const handleDeleteComment = (commentId) => {
        const updatedComments = post.comments.filter(comment => comment.id !== commentId);
        const updatedPost = { ...post, comments: updatedComments, commentsCount: Math.max(0, (post.commentsCount || 0) - 1) };

        axios.put(`http://localhost:9999/posts/${id}`, updatedPost)
            .then(() => {
                notification.success({
                    message: "🗑️ Đã xóa bình luận!",
                    description: "Bình luận đã được xóa khỏi bài viết.",
                    duration: 3,
                    placement: "topRight"
                });
                fetchPost();
            })
            .catch(() => message.error('Lỗi khi xóa bình luận!'));
    };

    const handleDeletePost = () => {
        axios.delete(`http://localhost:9999/posts/${id}`)
            .then(() => {
                notification.success({
                    message: "🗑️ Đã xóa bài viết!",
                    description: "Bài viết đã được xóa khỏi hệ thống.",
                    duration: 3,
                    placement: "topRight"
                });
                setTimeout(() => navigate('/'), 1500);
            })
            .catch(() => message.error('Lỗi khi xóa bài viết!'));
    };

    if (postLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><Spin size="large" /></div>;
    }

    if (!post) {
        return <div style={{ textAlign: 'center', padding: 40 }}><Text type="secondary">Không tìm thấy bài viết</Text></div>;
    }

    const canEdit = currentUser && (post.authorId === currentUser.id || currentUser.role === "admin");

    return (
        <div className="post-detail-container">
            <Card variant="borderless" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: 16 }}>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ marginBottom: 16 }} size="large">
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
                            <Popconfirm
                                title="Bạn có chắc chắn muốn xóa bài viết này?"
                                okText="Có"
                                cancelText="Không"
                                onConfirm={handleDeletePost}
                            >
                                <Button
                                    icon={<DeleteOutlined />}
                                    danger
                                    size="large"
                                    style={{ borderRadius: '8px' }}
                                >
                                    🗑️ Xóa
                                </Button>
                            </Popconfirm>
                        </Space>
                    )}
                </div>

                <Title level={2} style={{ color: '#1890ff', marginBottom: '16px' }}>📝 {post.title}</Title>

                <div style={{ marginBottom: 16 }}>
                    <Space size="middle">
                        <Space size="small">
                            <Avatar size="small" icon={<UserOutlined />} />
                            <Text type="secondary">{getAuthorName(post.authorId)}</Text>
                        </Space>
                        <Text type="secondary">📅 {moment(post.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                        <Tag color={post.visibility === 'public' ? 'green' : 'orange'}>
                            {post.visibility === 'public' ? '🌍 Công khai' : '🔐 Riêng tư'}
                        </Tag>
                    </Space>
                </div>

                <Divider />

                <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} style={{ lineHeight: 1.8, fontSize: '16px', marginBottom: '24px' }} />

                <Divider />

                {/* like + comment summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '16px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <Space size="large">
                        {currentUser ? (
                            <Button
                                type="text"
                                size="large"
                                icon={isLiked() ? <LikeFilled style={{ color: '#1890ff' }} /> : <LikeOutlined />}
                                onClick={handleLike}
                                style={{ color: isLiked() ? '#1890ff' : '#8c8c8c', fontSize: '16px', fontWeight: '500' }}
                            >
                                {isLiked() ? 'Đã like' : 'Like'} ({post.likesCount || 0})
                            </Button>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <LikeOutlined style={{ color: '#8c8c8c', fontSize: '16px' }} />
                                <Text style={{ color: '#8c8c8c', fontSize: '16px' }}>{post.likesCount || 0} likes</Text>
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                            <Text style={{ color: '#1890ff', fontSize: '16px' }}>{post.commentsCount || 0} bình luận</Text>
                        </div>
                    </Space>
                    {currentUser && currentUser.role === "admin" && (
                        <Tag color="red" style={{ fontSize: '12px', fontWeight: 'bold' }}>👑 ADMIN VIEW</Tag>
                    )}
                </div>

                <Divider orientation="left"><Space><MessageOutlined /> 💬 Bình luận ({post.commentsCount || 0})</Space></Divider>

                {currentUser && (
                    <div style={{ marginBottom: 24 }}>
                        <TextArea rows={3} placeholder="Nhập bình luận của bạn..." value={commentContent} onChange={(e) => setCommentContent(e.target.value)} style={{ marginBottom: 8, borderRadius: '8px' }} />
                        <Button type="primary" onClick={handleAddComment} loading={loading} style={{ borderRadius: '8px' }}>
                            {loading ? 'Đang gửi...' : '💬 Gửi bình luận'}
                        </Button>
                    </div>
                )}

                {!currentUser && (
                    <div style={{ marginBottom: 24, padding: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 12, color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Text style={{ color: 'white', fontSize: '16px' }}>💡 <strong>Mẹo:</strong> Đăng nhập để bình luận bài viết này!</Text>
                    </div>
                )}

                <List
                    className="comment-list"
                    dataSource={post.comments || []}
                    locale={{ emptyText: 'Chưa có bình luận nào' }}
                    renderItem={comment => (
                        <div key={comment.id} className="comment-item">
                            <Avatar style={{ backgroundColor: '#87d068' }}>{getCommentUser(comment.userId)[0]}</Avatar>
                            <div className="comment-content">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text strong>{getCommentUser(comment.userId)}</Text>
                                    {currentUser && (comment.userId === currentUser.id || currentUser.role === "admin") && (
                                        <Popconfirm
                                            title="Bạn có chắc chắn muốn xóa bình luận này?"
                                            okText="Có"
                                            cancelText="Không"
                                            onConfirm={() => handleDeleteComment(comment.id)}
                                        >
                                            <Button type="text" size="small" danger>🗑️ Xóa</Button>
                                        </Popconfirm>
                                    )}
                                </div>
                                <div style={{ margin: '8px 0' }}>{comment.content}</div>
                                <Text type="secondary" style={{ fontSize: 12 }}>⏰ {moment(comment.createdAt).fromNow()}</Text>
                            </div>
                        </div>
                    )}
                />
            </Card>
        </div>
    );
}
