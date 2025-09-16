import { useEffect, useState } from "react";
import { Button, Form, Input, Typography, Card, Avatar, Space, Divider, Row, Col, Tag, message, App, Upload } from "antd";
import { UserOutlined, SaveOutlined, EditOutlined, DeleteOutlined, PlusOutlined, LikeOutlined, MessageOutlined, UploadOutlined, LinkOutlined } from "@ant-design/icons";
import axios from "axios";
import "../style/Home.css";
import {useNavigate} from "react-router-dom";
import moment from "moment";

const { Title, Text } = Typography;

export default function Profile({ currentUser, setCurrentUser }) {
    const { notification } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [userPosts, setUserPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
        image: ""
    });
    const navigate = useNavigate();
    useEffect(() => {
        if (currentUser) {
            form.setFieldsValue({
                name: currentUser.name || "",
                username: currentUser.username || "",
                password: "",
                avatar: currentUser.avatar || "",
            });
            fetchUserPosts();
        }
    }, [currentUser, form]);

    const fetchUserPosts = () => {
        setPostsLoading(true);
        axios.get(`http://localhost:9999/posts?authorId=${currentUser.id}&_sort=createdAt&_order=desc`)
            .then(res => setUserPosts(res.data))
            .catch(err => {
                console.error(err);
                message.error('Lỗi khi tải bài viết!');
            })
            .finally(() => setPostsLoading(false));
    };

    // Xử lý upload ảnh
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra kích thước file (tối đa 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước ảnh không được vượt quá 5MB');
                return;
            }

            // Kiểm tra định dạng file
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh hợp lệ');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64String = e.target.result;
                setFormData(prev => ({
                    ...prev,
                    image: base64String
                }));
                setImagePreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (values) => {
        setLoading(true);
        try {
            const updateData = {
                name: values.name,
                username: values.username,
                avatar: formData.image || currentUser?.avatar || "",
            };
            if (values.password) {
                updateData.password = values.password;
            }

            await axios.put(`http://localhost:9999/users/${currentUser.id}`, { ...currentUser, ...updateData });
            
            const updatedUser = { ...currentUser, ...updateData };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            notification.success({
                message: "✅ Cập nhật thành công!",
                description: "Thông tin cá nhân đã được cập nhật.",
                duration: 3,
                placement: "topRight",
                style: {
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }
            });
            form.setFieldsValue({ password: "" }); // Reset password field
            
            // Tự động quay về trang Home sau 2 giây
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            message.error("Cập nhật thất bại! Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
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
                
                notification.success({
                    message: "🗑️ Đã xóa bài viết!",
                    description: `Bài viết và ${relatedComments.length} bình luận đã được xóa khỏi hệ thống.`,
                    duration: 3
                });
                fetchUserPosts();
            } catch (error) {
                notification.error({
                    message: 'Lỗi khi xóa bài viết!',
                    duration: 3
                });
                console.error("Delete error:", error);
            }
        }
    };

    return (
        <div className="profile-container">
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Avatar 
                                size={80} 
                                src={currentUser?.avatar || null}
                                icon={<UserOutlined />} 
                                style={{ 
                                    marginBottom: 16,
                                    background: currentUser?.role === 'admin' ? '#ff4d4f' : '#1890ff',
                                    border: '3px solid #fff',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                }} 
                            />
                            <Title level={3} style={{ marginBottom: 8 }}>
                                {currentUser?.name}
                            </Title>
                            <Space direction="vertical" size="small">
                                <Text type="secondary">@{currentUser?.username}</Text>
                                <Tag color={currentUser?.role === 'admin' ? 'red' : 'blue'} style={{ fontSize: '12px' }}>
                                    {currentUser?.role === 'admin' ? '👑 Quản trị viên' : '👤 Người dùng'}
                                </Tag>
                            </Space>
                        </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdate}
                    initialValues={{
                        name: currentUser?.name || "",
                        username: currentUser?.username || "",
                        password: "",
                        avatar: currentUser?.avatar || "",
                    }}
                >
                    <Form.Item
                        label="Họ và tên"
                        name="name"
                        rules={[
                            { required: true, message: "Vui lòng nhập họ và tên!" },
                            { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" }
                        ]}
                    >
                        <Input placeholder="Nhập họ và tên của bạn" />
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
                        label="Mật khẩu mới"
                        name="password"
                        rules={[
                            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }
                        ]}
                    >
                        <Input.Password placeholder="Để trống nếu không muốn thay đổi mật khẩu" />
                    </Form.Item>

                    <Form.Item
                        label="Ảnh đại diện"
                        name="avatar"
                        extra="Chọn file ảnh từ máy tính (tối đa 5MB, định dạng: JPG, PNG, GIF)"
                    >
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ 
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #d9d9d9',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    backgroundColor: '#fff'
                                }}
                            />
                            {imagePreview && (
                                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        style={{ 
                                            maxWidth: '100px', 
                                            maxHeight: '100px', 
                                            borderRadius: '8px',
                                            border: '2px solid #f0f0f0'
                                        }} 
                                    />
                                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                                        Xem trước ảnh đại diện
                                    </div>
                                </div>
                            )}
                        </div>
                    </Form.Item>

                    <Divider />

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading}
                                icon={<SaveOutlined />}
                                block
                                size="large"
                                style={{ borderRadius: '8px' }}
                            >
                                Cập nhật thông tin
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>

            <Col xs={24} lg={16}>
                <Card 
                    title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>📝 Bài viết của tôi ({userPosts.length})</span>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={() => navigate('/create')}
                                style={{ borderRadius: '8px' }}
                            >
                                Tạo bài mới
                            </Button>
                        </div>
                    }
                    style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    loading={postsLoading}
                >
                    {userPosts.length === 0 ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '40px 20px',
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                            borderRadius: '12px',
                            margin: '20px 0'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                            <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '16px' }}>
                                Bạn chưa có bài viết nào
                            </Text>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={() => navigate('/create')}
                                size="large"
                                style={{ borderRadius: '8px' }}
                            >
                                Tạo bài viết đầu tiên
                            </Button>
                        </div>
                    ) : (
                        <Row gutter={[16, 16]}>
                            {userPosts.map(post => (
                                <Col xs={24} key={post.id}>
                                    <Card
                                        hoverable
                                        style={{ borderRadius: '8px', border: '1px solid #f0f0f0' }}
                                        actions={[
                                            <Button
                                                key="view"
                                                type="text"
                                                onClick={() => navigate(`/post/${post.id}`)}
                                                style={{ color: '#1890ff' }}
                                            >
                                                👁️ Xem
                                            </Button>,
                                            <Button
                                                key="edit"
                                                type="text"
                                                icon={<EditOutlined />}
                                                onClick={() => navigate(`/edit/${post.id}`)}
                                                style={{ color: '#52c41a' }}
                                            >
                                                Sửa
                                            </Button>,
                                            <Button
                                                key="delete"
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDeletePost(post.id)}
                                            >
                                                Xóa
                                            </Button>
                                        ]}
                                    >
                                        <div>
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'flex-start',
                                                marginBottom: '12px'
                                            }}>
                                                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                                                    {post.title}
                                                </Title>
                                                <Tag color={post.visibility === 'public' ? 'green' : 'orange'} size="small">
                                                    {post.visibility === 'public' ? '🌍 Công khai' : '🔐 Riêng tư'}
                                                </Tag>
                                            </div>
                                            
                                            <Text ellipsis style={{ 
                                                display: 'block', 
                                                marginBottom: '12px',
                                                lineHeight: 1.6,
                                                color: '#666'
                                            }}>
                                                {post.content.replace(/<[^>]+>/g, "").slice(0, 150)}...
                                            </Text>
                                            
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center' 
                                            }}>
                                                <Space size="small">
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        👍 {post.likesCount || 0} likes
                                                    </Text>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        💬 {post.commentsCount || 0} bình luận
                                                    </Text>
                                                </Space>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    📅 {moment(post.createdAt).format('DD/MM/YYYY')}
                                                </Text>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Card>
            </Col>
        </Row>
    </div>
    );
}
