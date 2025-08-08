import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Select, Row, Col, Typography, Avatar, Tag, Space, } from "antd";
import { useNavigate } from "react-router-dom";
import { EditOutlined, DeleteOutlined, PlusOutlined, UserOutlined, } from "@ant-design/icons";
import moment from "moment";
import "../style/Home.css";

const { Title, Text } = Typography;

export default function Home({ currentUser }) {
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [visibilityFilter, setVisibilityFilter] = useState("all");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
        fetchUsers();
    }, []);

    const fetchPosts = () => {
        setLoading(true);
        axios.get("http://localhost:9999/posts?_sort=createdAt&_order=desc")
            .then(res => setPosts(res.data))
            .catch(err => {
                console.error(err);
                alert("Lỗi khi tải danh sách bài viết!");
            })
            .finally(() => setLoading(false));
    };

    const fetchUsers = () => {
        axios.get("http://localhost:9999/users")
            .then(res => setUsers(res.data))
            .catch(err => console.error(err));
    };

    const handleDelete = (postId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
            axios.delete(`http://localhost:9999/posts/${postId}`).then(() => {
              alert(
                  "Bài viết đã được xóa khỏi hệ thống."
                );
                fetchPosts();
            }).catch(() => {
                alert("Lỗi khi xóa bài viết!");
            });
        }
    };

    const getAuthorName = (authorId) => {
        const user = users.find(u => u.id === authorId);
        return user ? user.name : 'Unknown';
    };

    const filteredPosts = posts.filter(post => {
        if (!currentUser) {
            return post.visibility === "public";
        }
        if (visibilityFilter === "all") {
            return post.visibility === "public" || post.authorId === currentUser.id;
        } else if (visibilityFilter === "mine") {
            return post.authorId === currentUser.id;
        } else {
            return post.visibility === "public";
        }
    });

    return (
        <div className="home-container">
            <div className="home-header">
                <Title level={2}>📚 Danh sách bài viết</Title>
                {currentUser && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate("/create")}
                        size="large"
                        style={{
                            borderRadius: '8px',
                            height: '48px',
                            padding: '0 24px',
                            fontSize: '16px',
                            fontWeight: '500'
                        }}
                    >
                        ✨ Tạo bài viết
                    </Button>
                )}
            </div>

            {currentUser && (
                <Select
                    value={visibilityFilter}
                    onChange={setVisibilityFilter}
                    style={{ marginBottom: 20 }}
                    options={[
                        { label: "📖 Tất cả bài viết", value: "all" },
                        { label: "👤 Bài viết của tôi", value: "mine" },
                        { label: "🌍 Bài viết công khai", value: "public" }
                    ]}
                />
            )}

            {!currentUser && (
                <div style={{ 
                    marginBottom: 20, 
                    padding: 16, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    border: 'none', 
                    borderRadius: 12,
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <Text style={{ color: 'white', fontSize: '16px' }}>
                        💡 <strong>Mẹo:</strong> Đăng nhập để xem bài viết riêng tư và tạo bài viết mới!
                    </Text>
                </div>
            )}

            <Row gutter={[16, 16]}>
                {filteredPosts.map(post => (
                    <Col xs={24} md={12} lg={8} key={post.id}>
                        <Card
                            title={
                                <div>
                                    <div style={{ fontWeight: 600, color: '#1890ff', marginBottom: 4 }}>
                                        {post.title}
                                    </div>
                                    <Space size="small">
                                        <Avatar size="small" icon={<UserOutlined />} />
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {getAuthorName(post.authorId)}
                                        </Text>
                                        <Tag color={post.visibility === 'public' ? 'green' : 'orange'} size="small">
                                            {post.visibility === 'public' ? '🌍 Công khai' : '🔐 Riêng tư'}
                                        </Tag>
                                    </Space>
                                </div>
                            }
                            extra={
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    📅 {moment(post.createdAt).format('DD/MM/YYYY')}
                                </Text>
                            }
                            actions={
                                currentUser && post.authorId === currentUser.id ? [
                                    <EditOutlined key="edit" onClick={() => navigate(`/edit/${post.id}`)} />,
                                    <DeleteOutlined key="delete" onClick={() => handleDelete(post.id)} />
                                ] : []
                            }
                            onClick={() => navigate(`/post/${post.id}`)}
                            hoverable
                            loading={loading}
                        >
                            <div style={{ cursor: 'pointer' }}>
                                <Text ellipsis style={{ lineHeight: 1.6 }}>
                                    {post.content.replace(/<[^>]+>/g, "").slice(0, 120)}...
                                </Text>
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        💬 {post.comments?.length || 0} bình luận
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {filteredPosts.length === 0 && !loading && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: 60,
                    background: 'white',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                    <Text type="secondary" style={{ fontSize: '16px' }}>
                        Chưa có bài viết nào
                    </Text>
                    {currentUser && (
                        <div style={{ marginTop: '16px' }}>
                            <Button 
                                type="primary" 
                                onClick={() => navigate('/create')}
                                size="large"
                                style={{ borderRadius: '8px' }}
                            >
                                ✨ Tạo bài viết đầu tiên
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
