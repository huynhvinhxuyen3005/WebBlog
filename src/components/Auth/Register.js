import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Form, Input, Typography, Card, App } from "antd";
import { UserOutlined, LockOutlined, IdcardOutlined } from "@ant-design/icons";
import "../style/Register.css";

const { Title } = Typography;

export default function Register({ setCurrentUser }) {
    const { message, notification } = App.useApp();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const handleRegister = async (values) => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:9999/users?username=${values.username}`);
            if (res.data.length > 0) {
                message.error("Tên đăng nhập đã tồn tại!");
                return;
            }

            const newUser = {
                id: Date.now().toString(),
                name: values.name,
                username: values.username,
                password: values.password,
                role: "user"
            };

            await axios.post("http://localhost:9999/users", newUser);
            localStorage.setItem("user", JSON.stringify(newUser));
            setCurrentUser(newUser);
            notification.success({
                message: "🎉 Đăng ký thành công!",
                description: `Chào mừng ${newUser.name} đến với Blog System!`,
                duration: 3,
                placement: 'topRight',
                style: {
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
            });
            navigate("/");
        } catch (error) {
            message.error("Lỗi khi đăng ký tài khoản!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <Card className="register-card" bordered={false}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                    <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                        Đăng ký
                    </Title>
                    <p style={{ color: '#666', margin: '8px 0 0 0' }}>
                        Tạo tài khoản mới để bắt đầu viết blog
                    </p>
                </div>
                
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleRegister}
                >
                    <Form.Item
                        label={
                            <span style={{ fontWeight: '500' }}>
                                👤 Họ tên
                            </span>
                        }
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                    >
                        <Input 
                            prefix={<IdcardOutlined />}
                            placeholder="Nhập họ tên đầy đủ"
                            size="large"
                            style={{ borderRadius: '8px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: '500' }}>
                                🆔 Tên đăng nhập
                            </span>
                        }
                        name="username"
                        rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
                    >
                        <Input 
                            prefix={<UserOutlined />}
                            placeholder="Tạo tên đăng nhập"
                            size="large"
                            style={{ borderRadius: '8px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: '500' }}>
                                🔒 Mật khẩu
                            </span>
                        }
                        name="password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined />}
                            placeholder="Tạo mật khẩu"
                            size="large"
                            style={{ borderRadius: '8px' }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            block 
                            loading={loading}
                            size="large"
                            style={{ 
                                borderRadius: '8px',
                                height: '48px',
                                fontSize: '16px',
                                fontWeight: '500'
                            }}
                        >
                            {'Đăng ký'}
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <p style={{ color: '#666', margin: 0 }}>
                            Đã có tài khoản?{' '}
                            <a 
                                href="/login" 
                                style={{ color: '#1890ff', fontWeight: '500' }}
                            >
                                Đăng nhập ngay
                            </a>
                        </p>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
