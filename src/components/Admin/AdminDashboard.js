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
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={disabled}
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

    const handleDeletePost = (postId) => {
        axios.delete(`http://localhost:9999/posts/${postId}`)
            .then(() => {
                message.success("Đã xóa bài viết!");
                fetchAllData();
            })
            .catch(() => {
                message.error("Lỗi khi xóa bài viết!");
            });
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

    const handleEditUser = (user) => {
        setEditingUser(user);
        form.setFieldsValue({
            name: user.name,
            username: user.username,
            avatar: user.avatar || "",
        });
        setEditModalVisible(true);
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
            key: "username"
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (role) => (
                <Tag color={role === "admin" ? "red" : "blue"}>
                    {role === "admin" ? "👑 Admin" : "👤 User"}
                </Tag>
            )
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditUser(record)}
                        style={{ color: '#1890ff' }}
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
            render: (authorId) => {
                const author = users.find((u) => u.id === authorId);
                return author ? author.name : "Unknown";
            }
        },
        {
            title: "Trạng thái",
            dataIndex: "visibility",
            key: "visibility",
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
            render: (count) => <Text>👍 {count || 0}</Text>
        },
        {
            title: "Comments",
            dataIndex: "commentsCount",
            key: "commentsCount",
            render: (count) => <Text>💬 {count || 0}</Text>
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
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/post/${record.id}`)}
                    >
                        Xem
                    </Button>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/edit/${record.id}`)}
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
        <div style={{ padding: "24px" }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>👑 Bảng điều khiển Admin</Title>
                <Text type="secondary">Quản lý toàn bộ hệ thống blog</Text>
            </div>

            {/* Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng người dùng"
                            value={users.length}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng bài viết"
                            value={posts.length}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng bình luận"
                            value={comments.length}
                            prefix={<MessageOutlined />}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Users + Posts */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                    <Card
                        title="👥 Quản lý người dùng"
                        style={{ height: "100%" }}
                        extra={<Tag color="blue">{users.length} người dùng</Tag>}
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
                        style={{ height: "100%" }}
                        extra={<Tag color="green">{posts.length} bài viết</Tag>}
                    >
                        <Table
                            columns={postColumns}
                            dataSource={posts}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            size="small"
                            loading={loading}
                            scroll={{ x: 800 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Comments */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                    <Card
                        title="💬 Quản lý bình luận"
                        extra={<Tag color="orange">{comments.length} bình luận</Tag>}
                    >
                        <Table
                            columns={commentColumns}
                            dataSource={comments}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            size="small"
                            loading={loading}
                            scroll={{ x: 1000 }}
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
