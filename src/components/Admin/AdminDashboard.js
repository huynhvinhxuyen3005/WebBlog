import { useEffect, useState } from "react";
import {
    Card, Table, Button, Space, Tag, Typography,
    Row, Col, Statistic, Popconfirm, App, Modal, Form, Input, Avatar
} from "antd";
import {
    EditOutlined, DeleteOutlined, UserOutlined,
    FileTextOutlined, MessageOutlined, EyeOutlined, LinkOutlined
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

/**
 * Nút Xóa tái sử dụng với Popconfirm
 */
function ConfirmDeleteButton({ onConfirm, disabled, children, title }) {
    return (
        <Popconfirm
            title={title || "Bạn có chắc chắn muốn xóa mục này?"}
            onConfirm={onConfirm}
            okText="Có"
            cancelText="Không"
            disabled={disabled}
        >
            <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                disabled={disabled}
                size="small"
                style={{
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #ff4d4f, #cf1322)",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(255, 77, 79, 0.3)"
                }}
            >
                {children || "Xóa"}
            </Button>
        </Popconfirm>
    );
}

export default function AdminDashboard({ currentUser }) {
    const { message } = App.useApp(); // ✅ lấy message từ context
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser && currentUser.role === "admin") {
            fetchAllData();
            
            // Auto-refresh data every 10 seconds để cập nhật real-time
            const interval = setInterval(() => {
                fetchAllData();
            }, 10000);
            
            return () => clearInterval(interval);
        }
    }, [currentUser]);

    const fetchAllData = () => {
        setLoading(true);
        Promise.all([
            axios.get("http://localhost:9999/users"),
            axios.get("http://localhost:9999/posts?_sort=createdAt&_order=desc"),
            axios.get("http://localhost:9999/comments?_sort=createdAt&_order=desc")
        ])
            .then(([usersRes, postsRes, commentsRes]) => {
                setUsers(usersRes.data);
                setPosts(postsRes.data);
                setComments(commentsRes.data);
            })
            .catch(() => {
                message.error("Lỗi khi tải dữ liệu!");
            })
            .finally(() => setLoading(false));
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        form.setFieldsValue({
            name: user.name,
            username: user.username,
            avatar: user.avatar || "",
        });
        setEditModalVisible(true);
    };

    const handleDeleteUser = (userId) => {
        axios.delete(`http://localhost:9999/users/${userId}`)
            .then(() => {
                message.success("Đã xóa người dùng!");
                fetchAllData();
            })
            .catch(() => {
                message.error("Lỗi khi xóa người dùng!");
            });
    };

    const handleDeletePost = async (postId) => {
        try {
            // Xóa tất cả comments liên quan đến bài viết
            const commentsResponse = await axios.get('http://localhost:9999/comments');
            const relatedComments = commentsResponse.data.filter(comment => comment.postId === postId);
            
            // Xóa từng comment
            for (const comment of relatedComments) {
                await axios.delete(`http://localhost:9999/comments/${comment.id}`);
            }
            
            // Xóa bài viết
            await axios.delete(`http://localhost:9999/posts/${postId}`);
            
            message.success(`Đã xóa bài viết`);
            fetchAllData();
        } catch (error) {
            message.error("Lỗi khi xóa bài viết!");
            console.error("Delete post error:", error);
        }
    };

    const handleDeleteComment = (commentId) => {
        axios.delete(`http://localhost:9999/comments/${commentId}`)
            .then(() => {
                message.success("Đã xóa bình luận!");
                fetchAllData();
            })
            .catch(() => {
                message.error("Lỗi khi xóa bình luận!");
            });
    };


    const handleUpdateUser = async (values) => {
        try {
            const updateData = {
                ...editingUser,
                name: values.name,
                username: values.username,
                avatar: values.avatar || "",
            };

            await axios.put(`http://localhost:9999/users/${editingUser.id}`, updateData);
            message.success({
                content: "✅ Cập nhật thông tin người dùng thành công!",
                style: {
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }
            });
            setEditModalVisible(false);
            setEditingUser(null);
            form.resetFields();
            fetchAllData();
            
            // Tự động quay về trang Home sau 2 giây
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            message.error("Cập nhật thất bại! Vui lòng thử lại.");
        }
    };

    const userColumns = [
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
            width: 120,
            render: (text, record) => (
                <Space>
                    <Avatar 
                        size="small" 
                        src={record.avatar || null}
                        icon={<UserOutlined />}
                        style={{ 
                            background: record.role === 'admin' ? '#ff4d4f' : '#1890ff'
                        }}
                    />
                    <span>{text}</span>
                </Space>
            )
        },
        {
            title: "Username",
            dataIndex: "username",
            key: "username",
            width: 100
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            width: 80,
            render: (role) => (
                <Tag color={role === "admin" ? "red" : "blue"}>
                    {role === "admin" ? "👑 Admin" : "👤 User"}
                </Tag>
            )
        },
        {
            title: "Hành động",
            key: "action",
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEditUser(record)}
                        size="small"
                        style={{
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #1890ff, #722ed1)",
                            border: "none",
                            boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)"
                        }}
                    >
                        Sửa
                    </Button>
                    <ConfirmDeleteButton
                        title="Bạn có chắc chắn muốn xóa người dùng này?"
                        onConfirm={() => handleDeleteUser(record.id)}
                        disabled={record.id === currentUser.id}
                    />
                </Space>
            )
        }
    ];

    const postColumns = [
        {
            title: "Tiêu đề",
            dataIndex: "title",
            key: "title",
            width: 200,
            render: (text) => (
                <Space>
                    <FileTextOutlined />
                    <span style={{ fontWeight: "bold", color: "#1890ff" }}>{text}</span>
                </Space>
            )
        },
        {
            title: "Tác giả",
            dataIndex: "authorId",
            key: "authorId",
            width: 120,
            render: (authorId) => {
                const author = users.find((u) => u.id === authorId);
                return author ? author.name : "Unknown";
            }
        },
        {
            title: "Trạng thái",
            dataIndex: "visibility",
            key: "visibility",
            width: 100,
            render: (visibility) => (
                <Tag color={visibility === "public" ? "green" : "orange"}>
                    {visibility === "public" ? "🌍 Công khai" : "🔐 Riêng tư"}
                </Tag>
            )
        },
        {
            title: "Likes",
            dataIndex: "likesCount",
            key: "likesCount",
            width: 80,
            render: (count) => <Text>👍 {count || 0}</Text>
        },
        {
            title: "Comments",
            dataIndex: "commentsCount",
            key: "commentsCount",
            width: 80,
            render: (count) => <Text>💬 {count || 0}</Text>
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 120,
            render: (date) => moment(date).format("DD/MM/YYYY HH:mm")
        },
        {
            title: "Hành động",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="default"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/post/${record.id}`)}
                        size="small"
                        style={{
                            borderRadius: "8px",
                            border: "2px solid #1890ff",
                            color: "#1890ff",
                            boxShadow: "0 2px 8px rgba(24, 144, 255, 0.2)"
                        }}
                    >
                        Xem
                    </Button>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/edit/${record.id}`)}
                        size="small"
                        style={{
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #52c41a, #389e0d)",
                            border: "none",
                            boxShadow: "0 2px 8px rgba(82, 196, 26, 0.3)"
                        }}
                    >
                        Sửa
                    </Button>
                    <ConfirmDeleteButton
                        title="Bạn có chắc chắn muốn xóa bài viết này?"
                        onConfirm={() => handleDeletePost(record.id)}
                    />
                </Space>
            )
        }
    ];

    const commentColumns = [
        {
            title: "Nội dung",
            dataIndex: "content",
            key: "content",
            render: (text) => (
                <div style={{ maxWidth: 300 }}>
                    <Text ellipsis>{text}</Text>
                </div>
            )
        },
        {
            title: "Người bình luận",
            dataIndex: "userId",
            key: "userId",
            render: (userId) => {
                const user = users.find((u) => u.id === userId);
                return user ? user.name : "Unknown";
            }
        },
        {
            title: "Bài viết",
            dataIndex: "postId",
            key: "postId",
            render: (postId) => {
                const post = posts.find((p) => p.id === postId);
                return post ? (
                    <Button
                        type="link"
                        onClick={() => navigate(`/post/${postId}`)}
                        style={{ padding: 0, height: "auto" }}
                    >
                        {post.title}
                    </Button>
                ) : (
                    "Unknown"
                );
            }
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => moment(date).format("DD/MM/YYYY HH:mm")
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <ConfirmDeleteButton
                    title="Bạn có chắc chắn muốn xóa bình luận này?"
                    onConfirm={() => handleDeleteComment(record.id)}
                />
            )
        }
    ];

    if (!currentUser || currentUser.role !== "admin") {
        return (
            <div style={{ textAlign: "center", padding: 40 }}>
                <Text type="secondary">Bạn không có quyền truy cập trang này!</Text>
            </div>
        );
    }

    return (
        <div style={{ 
            padding: "24px", 
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            minHeight: "100vh"
        }}>
            <div style={{ 
                marginBottom: 32, 
                textAlign: "center",
                padding: "20px",
                background: "rgba(255,255,255,0.9)",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
            }}>
                <Title level={2} style={{ 
                    color: "#1890ff", 
                    marginBottom: 8,
                    textShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                    👑 Bảng điều khiển Admin
                </Title>
                <Text type="secondary" style={{ fontSize: "16px" }}>
                    Quản lý toàn bộ hệ thống blog
                </Text>
            </div>

            {/* Stats */}
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                <Col xs={24} sm={8}>
                    <Card style={{
                        borderRadius: "16px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                        border: "none",
                        background: "rgba(255,255,255,0.95)",
                        transition: "all 0.3s ease"
                    }}>
                        <Statistic
                            title="👥 Tổng người dùng"
                            value={users.length}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: "#1890ff", fontSize: "24px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{
                        borderRadius: "16px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                        border: "none",
                        background: "rgba(255,255,255,0.95)",
                        transition: "all 0.3s ease"
                    }}>
                        <Statistic
                            title="📝 Tổng bài viết"
                            value={posts.length}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: "#52c41a", fontSize: "24px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{
                        borderRadius: "16px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                        border: "none",
                        background: "rgba(255,255,255,0.95)",
                        transition: "all 0.3s ease"
                    }}>
                        <Statistic
                            title="💬 Tổng bình luận"
                            value={comments.length}
                            prefix={<MessageOutlined />}
                            valueStyle={{ color: "#faad14", fontSize: "24px", fontWeight: "bold" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Users + Posts */}
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card
                        title="👥 Quản lý người dùng"
                        style={{ 
                            height: "100%",
                            borderRadius: "16px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                            border: "none",
                            background: "rgba(255,255,255,0.95)"
                        }}
                        headStyle={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            borderRadius: "16px 16px 0 0",
                            border: "none"
                        }}
                        bodyStyle={{
                            borderRadius: "0 0 16px 16px"
                        }}
                        extra={<Tag color="blue" style={{ borderRadius: "20px" }}>{users.length} người dùng</Tag>}
                    >
                        <Table
                            columns={userColumns}
                            dataSource={users}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            size="small"
                            loading={loading}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card
                        title="📝 Quản lý bài viết"
                        style={{ 
                            height: "100%",
                            borderRadius: "16px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                            border: "none",
                            background: "rgba(255,255,255,0.95)"
                        }}
                        headStyle={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            borderRadius: "16px 16px 0 0",
                            border: "none"
                        }}
                        bodyStyle={{
                            borderRadius: "0 0 16px 16px"
                        }}
                        extra={<Tag color="green" style={{ borderRadius: "20px" }}>{posts.length} bài viết</Tag>}
                    >
                        <Table
                            columns={postColumns}
                            dataSource={posts}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            size="small"
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Comments */}
            <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
                <Col xs={24}>
                    <Card
                        title="💬 Quản lý bình luận"
                        style={{
                            borderRadius: "16px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                            border: "none",
                            background: "rgba(255,255,255,0.95)"
                        }}
                        headStyle={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            borderRadius: "16px 16px 0 0",
                            border: "none"
                        }}
                        bodyStyle={{
                            borderRadius: "0 0 16px 16px"
                        }}
                        extra={<Tag color="orange" style={{ borderRadius: "20px" }}>{comments.length} bình luận</Tag>}
                    >
                        <Table
                            columns={commentColumns}
                            dataSource={comments}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            size="small"
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Edit User Modal */}
            <Modal
                title="Chỉnh sửa thông tin người dùng"
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    setEditingUser(null);
                    form.resetFields();
                }}
                footer={null}
                width={500}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateUser}
                >
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Avatar 
                            size={60} 
                            src={editingUser?.avatar || null}
                            icon={<UserOutlined />}
                            style={{ 
                                background: editingUser?.role === 'admin' ? '#ff4d4f' : '#1890ff',
                                border: '2px solid #fff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }} 
                        />
                    </div>

                    <Form.Item
                        label="Họ và tên"
                        name="name"
                        rules={[
                            { required: true, message: "Vui lòng nhập họ và tên!" },
                            { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" }
                        ]}
                    >
                        <Input placeholder="Nhập họ và tên" />
                    </Form.Item>

                    <Form.Item
                        label="Tên đăng nhập"
                        name="username"
                        rules={[
                            { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                            { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" }
                        ]}
                    >
                        <Input placeholder="Nhập tên đăng nhập" />
                    </Form.Item>

                    <Form.Item
                        label="Ảnh đại diện (URL)"
                        name="avatar"
                        extra="Nhập URL ảnh từ internet (ví dụ: https://example.com/avatar.jpg)"
                    >
                        <Input 
                            placeholder="https://example.com/avatar.jpg"
                            prefix={<LinkOutlined />}
                            style={{ borderRadius: '8px' }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => {
                                setEditModalVisible(false);
                                setEditingUser(null);
                                form.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" style={{ borderRadius: '8px' }}>
                                Cập nhật
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
