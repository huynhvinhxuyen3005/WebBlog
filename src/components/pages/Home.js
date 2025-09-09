import { useEffect, useState } from "react";
import axios from "axios";
import {
    Button, Card, Select, Row, Col, Typography, Avatar,
    Tag, Space, App, Popconfirm
} from "antd";
import { useNavigate } from "react-router-dom";
import {
    EditOutlined, DeleteOutlined, PlusOutlined, UserOutlined,
    LikeOutlined, LikeFilled, MessageOutlined
} from "@ant-design/icons";
import moment from "moment";
import "../style/Home.css";

const { Title, Text } = Typography;

export default function Home({ currentUser }) {
    const { message, notification } = App.useApp();
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [likes, setLikes] = useState([]);
    const [visibilityFilter, setVisibilityFilter] = useState("all");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
        fetchUsers();
        fetchLikes();
    }, []);

    const fetchPosts = () => {
        setLoading(true);
        axios
            .get("http://localhost:9999/posts?_sort=createdAt&_order=desc")
            .then((res) => setPosts(res.data))
            .catch(() => {
                message.error("Lỗi khi tải danh sách bài viết!");
            })
            .finally(() => setLoading(false));
    };

    const fetchUsers = () => {
        axios.get("http://localhost:9999/users")
            .then((res) => setUsers(res.data))
            .catch(err => console.error(err));
    };

    const fetchLikes = () => {
        axios.get("http://localhost:9999/likes")
            .then((res) => setLikes(res.data))
            .catch(err => console.error(err));
    };

    const handleDelete = (postId) => {
        axios.delete(`http://localhost:9999/posts/${postId}`)
            .then(() => {
                notification.success({
                    message: "🗑️ Đã xóa bài viết!",
                    description: "Bài viết đã được xóa khỏi hệ thống.",
                    duration: 3,
                    placement: "topRight",
                    style: {
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                    }
                });
                fetchPosts();
            })
            .catch(() => {
                message.error("Lỗi khi xóa bài viết!");
            });
    };

    const getAuthorName = (authorId) => {
        const user = users.find((u) => u.id === authorId);
        return user ? user.name : "Unknown";
    };

    const isLiked = (postId) => {
        return (
            currentUser &&
            likes.some(
                (like) => like.userId === currentUser.id && like.postId === postId
            )
        );
    };

    const handleLike = async (postId) => {
        if (!currentUser) {
            message.error("Vui lòng đăng nhập để like bài viết!");
            return;
        }

        const existingLike = likes.find(
            (like) => like.userId === currentUser.id && like.postId === postId
        );

        try {
            if (existingLike) {
                // Unlike
                await axios.delete(`http://localhost:9999/likes/${existingLike.id}`);
                const updatedPost = posts.find((p) => p.id === postId);
                if (updatedPost) {
                    await axios.put(`http://localhost:9999/posts/${postId}`, {
                        ...updatedPost,
                        likesCount: Math.max(0, updatedPost.likesCount - 1)
                    });
                }
            } else {
                // Like
                const newLike = {
                    id: Date.now().toString(),
                    userId: currentUser.id,
                    postId: postId
                };
                await axios.post("http://localhost:9999/likes", newLike);
                const updatedPost = posts.find((p) => p.id === postId);
                if (updatedPost) {
                    await axios.put(`http://localhost:9999/posts/${postId}`, {
                        ...updatedPost,
                        likesCount: updatedPost.likesCount + 1
                    });
                }
            }
            fetchPosts();
            fetchLikes();
        } catch (error) {
            message.error("Có lỗi xảy ra khi like bài viết!");
        }
    };

    const filteredPosts = posts.filter((post) => {
        if (!currentUser) {
            return post.visibility === "public";
        }
        if (currentUser.role === "admin") {
            return true; // Admin thấy tất cả
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
                <Space>
                    {currentUser && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/create")}
                            size="large"
                            style={{
                                borderRadius: "8px",
                                height: "48px",
                                padding: "0 24px",
                                fontSize: "16px",
                                fontWeight: "500"
                            }}
                        >
                            ✨ Tạo bài viết
                        </Button>
                    )}
                </Space>
            </div>

            {currentUser && currentUser.role !== "admin" && (
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

            {currentUser && currentUser.role === "admin" && (
                <div
                    style={{
                        marginBottom: 20,
                        padding: 16,
                        background:
                            "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                        border: "none",
                        borderRadius: 12,
                        color: "white",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                >
                    <Text style={{ color: "white", fontSize: "16px" }}>
                        👑 <strong>Chế độ Admin:</strong> Bạn có thể xem và quản lý tất cả bài viết!
                    </Text>
                </div>
            )}

            {!currentUser && (
                <div
                    style={{
                        marginBottom: 20,
                        padding: 16,
                        background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        borderRadius: 12,
                        color: "white",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                >
                    <Text style={{ color: "white", fontSize: "16px" }}>
                        💡 <strong>Mẹo:</strong> Đăng nhập để xem bài viết riêng tư và tạo bài viết mới!
                    </Text>
                </div>
            )}

            <Row gutter={[16, 16]}>
                {filteredPosts.map((post) => (
                    <Col xs={24} md={12} lg={8} key={post.id}>
                        <Card
                            title={
                                <div>
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            color: "#1890ff",
                                            marginBottom: 4
                                        }}
                                    >
                                        {post.title}
                                    </div>
                                    <Space size="small">
                                        <Avatar size="small" icon={<UserOutlined />} />
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {getAuthorName(post.authorId)}
                                        </Text>
                                        <Tag
                                            color={post.visibility === "public" ? "green" : "orange"}
                                            size="small"
                                        >
                                            {post.visibility === "public"
                                                ? "🌍 Công khai"
                                                : "🔐 Riêng tư"}
                                        </Tag>
                                    </Space>
                                </div>
                            }
                            extra={
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    📅 {moment(post.createdAt).format("DD/MM/YYYY")}
                                </Text>
                            }
                            actions={[
                                ...(currentUser
                                    ? [
                                        <Button
                                            key="like"
                                            type="text"
                                            icon={
                                                isLiked(post.id) ? (
                                                    <LikeFilled style={{ color: "#1890ff" }} />
                                                ) : (
                                                    <LikeOutlined />
                                                )
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLike(post.id);
                                            }}
                                            style={{
                                                color: isLiked(post.id) ? "#1890ff" : "#8c8c8c"
                                            }}
                                        >
                                            {post.likesCount || 0}
                                        </Button>
                                    ]
                                    : []),
                                <Button
                                    key="comment"
                                    type="text"
                                    icon={<MessageOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/post/${post.id}`);
                                    }}
                                >
                                    {post.commentsCount || 0}
                                </Button>,
                                ...(currentUser &&
                                (post.authorId === currentUser.id ||
                                    currentUser.role === "admin")
                                    ? [
                                        <Button
                                            key="edit"
                                            type="text"
                                            icon={<EditOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/edit/${post.id}`);
                                            }}
                                        />
                                    ]
                                    : []),
                                ...(currentUser &&
                                (post.authorId === currentUser.id ||
                                    currentUser.role === "admin")
                                    ? [
                                        <Popconfirm
                                            key="delete"
                                            title="Bạn có chắc chắn muốn xóa bài viết này?"
                                            okText="Có"
                                            cancelText="Không"
                                            onConfirm={(e) => {
                                                e?.stopPropagation();
                                                handleDelete(post.id);
                                            }}
                                        >
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </Popconfirm>
                                    ]
                                    : [])
                            ]}
                            onClick={() => navigate(`/post/${post.id}`)}
                            hoverable
                            loading={loading}
                        >
                            <div style={{ cursor: "pointer" }}>
                                <Text ellipsis style={{ lineHeight: 1.6 }}>
                                    {post.content.replace(/<[^>]+>/g, "").slice(0, 120)}...
                                </Text>
                                <div
                                    style={{
                                        marginTop: 8,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}
                                >
                                    <Space size="small">
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            👍 {post.likesCount || 0} likes
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            💬 {post.commentsCount || 0} bình luận
                                        </Text>
                                    </Space>
                                    {currentUser && currentUser.role === "admin" && (
                                        <Tag color="red" size="small">
                                            ADMIN
                                        </Tag>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {filteredPosts.length === 0 && !loading && (
                <div
                    style={{
                        textAlign: "center",
                        padding: 60,
                        background: "white",
                        borderRadius: 12,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}
                >
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
                    <Text type="secondary" style={{ fontSize: "16px" }}>
                        Chưa có bài viết nào
                    </Text>
                    {currentUser && (
                        <div style={{ marginTop: "16px" }}>
                            <Button
                                type="primary"
                                onClick={() => navigate("/create")}
                                size="large"
                                style={{ borderRadius: "8px" }}
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
