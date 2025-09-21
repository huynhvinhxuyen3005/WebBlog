import { useEffect, useState } from "react";
import { Button, Form, Input, Typography, Card, Avatar, Space, Row, Col, Tag, message, App } from "antd";
import { UserOutlined, SaveOutlined, EditOutlined, DeleteOutlined, PlusOutlined, MessageOutlined } from "@ant-design/icons";
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
    const [showEditForm, setShowEditForm] = useState(false);
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
            setShowEditForm(false); // Ẩn form sau khi cập nhật thành công
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
        <div style={{ 
            padding: "24px", 
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            minHeight: "100vh"
        }}>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card style={{ 
                        borderRadius: '20px', 
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        border: 'none',
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ 
                            textAlign: 'center', 
                            marginBottom: 24,
                            padding: '20px 0'
                        }}>
                            <div style={{
                                position: 'relative',
                                display: 'inline-block',
                                marginBottom: 20
                            }}>
                            <Avatar 
                                    size={100} 
                                src={currentUser?.avatar || null}
                                icon={<UserOutlined />} 
                                style={{ 
                                        background: currentUser?.role === 'admin' 
                                            ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' 
                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: '4px solid #fff',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                                        transition: 'all 0.3s ease'
                                    }} 
                                />
                                {currentUser?.role === 'admin' && (
                                    <div style={{
                                        position: 'absolute',
                                        top: -5,
                                        right: -5,
                                        background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                                        borderRadius: '50%',
                                        width: 30,
                                        height: 30,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '16px',
                                        boxShadow: '0 4px 12px rgba(255,215,0,0.4)'
                                    }}>
                                        👑
                                    </div>
                                )}
                            </div>
                            
                            <Title level={2} style={{ 
                                marginBottom: 8,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                fontWeight: 'bold'
                            }}>
                                {currentUser?.name}
                            </Title>
                            
                            <Space direction="vertical" size="small" style={{ marginBottom: 24 }}>
                                <Text type="secondary" style={{ 
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: '#666'
                                }}>
                                    @{currentUser?.username}
                                </Text>
                                <Tag 
                                    color={currentUser?.role === 'admin' ? 'red' : 'blue'} 
                                    style={{ 
                                        fontSize: '14px',
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        fontWeight: '500',
                                        border: 'none',
                                        background: currentUser?.role === 'admin' 
                                            ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white'
                                    }}
                                >
                                    {currentUser?.role === 'admin' ? '👑 Quản trị viên' : '👤 Người dùng'}
                                </Tag>
                            </Space>
                            
                            {!showEditForm && (
                                <div style={{ marginTop: 24 }}>
                                    <Button 
                                        type="primary" 
                                        icon={<EditOutlined />}
                                        onClick={() => setShowEditForm(true)}
                                        size="large"
                                        style={{ 
                                            borderRadius: '12px',
                                            height: '48px',
                                            padding: '0 32px',
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                                        }}
                                    >
                                        Cập nhật thông tin
                                    </Button>
                                </div>
                            )}
                        </div>

                {showEditForm && (
                    <div style={{
                        background: 'rgba(255,255,255,0.8)',
                        borderRadius: '16px',
                        padding: '24px',
                        marginTop: '20px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(10px)'
                    }}>
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
                            label={<span style={{ fontWeight: '600', color: '#333' }}>Họ và tên *</span>}
                        name="name"
                        rules={[
                            { required: true, message: "Vui lòng nhập họ và tên!" },
                            { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" }
                        ]}
                    >
                            <Input 
                                placeholder="Nhập họ và tên của bạn" 
                                style={{
                                    borderRadius: '12px',
                                    height: '48px',
                                    fontSize: '16px',
                                    border: '2px solid #f0f0f0',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                    </Form.Item>

                    <Form.Item
                            label={<span style={{ fontWeight: '600', color: '#333' }}>Tên đăng nhập *</span>}
                        name="username"
                        rules={[
                            { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                            { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" }
                        ]}
                    >
                            <Input 
                                placeholder="Nhập tên đăng nhập" 
                                style={{
                                    borderRadius: '12px',
                                    height: '48px',
                                    fontSize: '16px',
                                    border: '2px solid #f0f0f0',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                    </Form.Item>

                    <Form.Item
                            label={<span style={{ fontWeight: '600', color: '#333' }}>Mật khẩu mới</span>}
                        name="password"
                    >
                            <Input.Password 
                                placeholder="Để trống nếu không muốn thay đổi mật khẩu" 
                                style={{
                                    borderRadius: '12px',
                                    height: '48px',
                                    fontSize: '16px',
                                    border: '2px solid #f0f0f0',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                    </Form.Item>

                    <Form.Item
                            label={<span style={{ fontWeight: '600', color: '#333' }}>Ảnh đại diện</span>}
                        name="avatar"
                            extra={
                                <span style={{ 
                                    fontSize: '12px', 
                                    color: '#666',
                                    fontStyle: 'italic'
                                }}>
                                    Chọn file ảnh từ máy tính (tối đa 5MB, định dạng: JPG, PNG, GIF)
                                </span>
                            }
                    >
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ 
                                    width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid #f0f0f0',
                                        borderRadius: '12px',
                                    fontSize: '14px',
                                        backgroundColor: '#fff',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                }}
                            />
                            {imagePreview && (
                                    <div style={{ 
                                        marginTop: '16px', 
                                        textAlign: 'center',
                                        padding: '16px',
                                        background: 'rgba(102, 126, 234, 0.1)',
                                        borderRadius: '12px',
                                        border: '2px dashed rgba(102, 126, 234, 0.3)'
                                    }}>
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        style={{ 
                                                maxWidth: '120px', 
                                                maxHeight: '120px', 
                                                borderRadius: '12px',
                                                border: '3px solid #fff',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }} 
                                        />
                                        <div style={{ 
                                            marginTop: '12px', 
                                            fontSize: '14px', 
                                            color: '#667eea',
                                            fontWeight: '500'
                                        }}>
                                            ✨ Xem trước ảnh đại diện
                                    </div>
                                </div>
                            )}
                        </div>
                    </Form.Item>

                        <div style={{ marginTop: '32px' }}>
                            <Space style={{ width: '100%' }} size="middle">
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading}
                                icon={<SaveOutlined />}
                                    size="large"
                                    style={{ 
                                        borderRadius: '12px', 
                                        flex: 1,
                                        height: '48px',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(82, 196, 26, 0.4)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Lưu thay đổi
                                </Button>
                                <Button 
                                    onClick={() => setShowEditForm(false)}
                                size="large"
                                    style={{ 
                                        borderRadius: '12px', 
                                        flex: 1,
                                        height: '48px',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        border: '2px solid #d9d9d9',
                                        color: '#666',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Hủy
                            </Button>
                            </Space>
                        </div>
                    </Form>
                    </div>
                )}
                </Card>
            </Col>

            <Col xs={24} lg={16}>
                <Card 
                    title={
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '8px 0'
                        }}>
                            <span style={{ 
                                fontSize: '20px',
                                fontWeight: '600',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                📝 Bài viết của tôi ({userPosts.length})
                            </span>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={() => navigate('/create')}
                                style={{ 
                                    borderRadius: '12px',
                                    height: '40px',
                                    padding: '0 20px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.4)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Tạo bài mới
                            </Button>
                        </div>
                    }
                    style={{ 
                        borderRadius: '20px', 
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        border: 'none',
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)'
                    }}
                    headStyle={{
                        background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%)',
                        borderRadius: '20px 20px 0 0',
                        border: 'none',
                        padding: '20px 24px'
                    }}
                    bodyStyle={{
                        borderRadius: '0 0 20px 20px',
                        padding: '24px'
                    }}
                    loading={postsLoading}
                >
                    {userPosts.length === 0 ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px',
                            background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%)',
                            borderRadius: '16px',
                            margin: '20px 0',
                            border: '2px dashed rgba(102, 126, 234, 0.3)'
                        }}>
                            <div style={{ 
                                fontSize: '64px', 
                                marginBottom: '20px',
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                            }}>📝</div>
                            <Text style={{ 
                                fontSize: '18px', 
                                display: 'block', 
                                marginBottom: '8px',
                                color: '#333',
                                fontWeight: '500'
                            }}>
                                Bạn chưa có bài viết nào
                            </Text>
                            <Text type="secondary" style={{ 
                                fontSize: '14px', 
                                display: 'block', 
                                marginBottom: '24px' 
                            }}>
                                Hãy tạo bài viết đầu tiên để chia sẻ với mọi người!
                            </Text>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={() => navigate('/create')}
                                size="large"
                                style={{ 
                                    borderRadius: '12px',
                                    height: '48px',
                                    padding: '0 32px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                    border: 'none',
                                    boxShadow: '0 6px 20px rgba(82, 196, 26, 0.4)',
                                    transition: 'all 0.3s ease'
                                }}
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
                                        style={{ 
                                            borderRadius: '16px', 
                                            border: 'none',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                            transition: 'all 0.3s ease',
                                            background: 'rgba(255,255,255,0.9)',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        actions={[
                                            <Button
                                                key="view"
                                                type="text"
                                                onClick={() => navigate(`/post/${post.id}`)}
                                                style={{ 
                                                    color: '#1890ff',
                                                    fontWeight: '500',
                                                    borderRadius: '8px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                👁️ Xem
                                            </Button>,
                                            <Button
                                                key="edit"
                                                type="text"
                                                icon={<EditOutlined />}
                                                onClick={() => navigate(`/edit/${post.id}`)}
                                                style={{ 
                                                    color: '#52c41a',
                                                    fontWeight: '500',
                                                    borderRadius: '8px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                Sửa
                                            </Button>,
                                            <Button
                                                key="delete"
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDeletePost(post.id)}
                                                style={{ 
                                                    fontWeight: '500',
                                                    borderRadius: '8px',
                                                    transition: 'all 0.3s ease'
                                                }}
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
                                                marginBottom: '16px'
                                            }}>
                                                <Title level={4} style={{ 
                                                    margin: 0, 
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    backgroundClip: 'text',
                                                    fontWeight: '600'
                                                }}>
                                                    {post.title}
                                                </Title>
                                                <Tag 
                                                    color={post.visibility === 'public' ? 'green' : 'orange'} 
                                                    style={{
                                                        borderRadius: '12px',
                                                        padding: '4px 12px',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        border: 'none',
                                                        background: post.visibility === 'public' 
                                                            ? 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
                                                            : 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)',
                                                        color: 'white'
                                                    }}
                                                >
                                                    {post.visibility === 'public' ? '🌍 Công khai' : '🔐 Riêng tư'}
                                                </Tag>
                                            </div>
                                            
                                            <Text ellipsis style={{ 
                                                display: 'block', 
                                                marginBottom: '16px',
                                                lineHeight: 1.6,
                                                color: '#666',
                                                fontSize: '14px'
                                            }}>
                                                {post.content.replace(/<[^>]+>/g, "").slice(0, 150)}...
                                            </Text>
                                            
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                padding: '12px 16px',
                                                background: 'rgba(102, 126, 234, 0.05)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(102, 126, 234, 0.1)'
                                            }}>
                                                <Space size="middle">
                                                    <Text type="secondary" style={{ 
                                                        fontSize: '13px',
                                                        fontWeight: '500',
                                                        color: '#666'
                                                    }}>
                                                        👍 {post.likesCount || 0} likes
                                                    </Text>
                                                    <Text type="secondary" style={{ 
                                                        fontSize: '13px',
                                                        fontWeight: '500',
                                                        color: '#666',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <MessageOutlined style={{ fontSize: '12px' }} />
                                                        {post.commentsCount || 0} bình luận
                                                    </Text>
                                                </Space>
                                                <Text type="secondary" style={{ 
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    color: '#999'
                                                }}>
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
