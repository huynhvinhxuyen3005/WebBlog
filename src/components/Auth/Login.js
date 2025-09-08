import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Form, Input, Typography, Card, App } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import "../style/Login.css";

const { Title } = Typography;

export default function Login({ setCurrentUser }) {
    const { message, notification } = App.useApp();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const handleLogin = (values) => {
        setLoading(true);
        axios.get(`http://localhost:9999/users?username=${values.username}&password=${values.password}`).then((res) => {
                if (res.data.length > 0) {
                    const user = res.data[0];
                    localStorage.setItem("user", JSON.stringify(user));
                    setCurrentUser(user);
                    notification.success({
                        message: "🎉 Đăng nhập thành công!",
                        description: `Chào mừng ${user.name} trở lại với Blog System!`,
                        duration: 3,
                        placement: 'topRight',
                        style: {
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }
                    });
                    navigate("/");
                } else {
                    message.error("Sai tên đăng nhập hoặc mật khẩu!");
                }
            })
            .catch(() => {
                message.error("Lỗi khi đăng nhập!");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="login-container">
            <Card className="login-card">
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
                    <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                        Đăng nhập
                    </Title>
                    <p style={{ color: '#666', margin: '8px 0 0 0' }}>
                        Chào mừng bạn trở lại với Blog System
                    </p>
                </div>
                
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleLogin}
                >
                    <Form.Item
                        label={
                            <span style={{ fontWeight: '500' }}>
                                👤 Tên đăng nhập
                            </span>
                        }
                        name="username"
                        rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
                    >
                        <Input 
                            prefix={<UserOutlined />}
                            placeholder="Nhập tên đăng nhập của bạn"
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
                            placeholder="Nhập mật khẩu của bạn"
                            size="large"
                            style={{ borderRadius: '8px' }}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit"
                            block
                            size="large"
                            style={{ 
                                borderRadius: '8px',
                                height: '48px',
                                fontSize: '16px',
                                fontWeight: '500'
                            }}
                        >
                            {'🚀 Đăng nhập'}
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <p style={{ color: '#666', margin: 0 }}>
                            Chưa có tài khoản?{' '}
                            <a 
                                href="/register" 
                                style={{ color: '#1890ff', fontWeight: '500' }}
                            >
                                Đăng ký ngay
                            </a>
                        </p>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
