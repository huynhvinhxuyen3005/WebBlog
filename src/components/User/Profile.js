import { useEffect, useState } from "react";
import { Button, Form, Input, Typography, Card, Avatar, Space, Divider } from "antd";
import { UserOutlined, SaveOutlined } from "@ant-design/icons";
import axios from "axios";
import "../style/Home.css";
import {useNavigate} from "react-router-dom";

const { Title, Text } = Typography;

export default function Profile({ currentUser, setCurrentUser }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        if (currentUser) {
            form.setFieldsValue({
                name: currentUser.name || "",
                username: currentUser.username || "",
                password: "",
            });
        }
    }, [currentUser, form]);

    const handleUpdate = async (values) => {
        setLoading(true);
        try {
            const updateData = {
                name: values.name,
                username: values.username,
            };
            if (values.password) {
                updateData.password = values.password;
            }

            await axios.patch(`http://localhost:9999/users/${currentUser.id}`, updateData);
            
            const updatedUser = { ...currentUser, ...updateData };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            alert("Cập nhật thông tin thành công!");
            navigate("/")
            form.setFieldsValue({ password: "" }); // Reset password field
        } catch (error) {
            alert("Cập nhật thất bại! Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <Card>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
                    <Title level={3}>Thông tin cá nhân</Title>
                    <Text type="secondary">Cập nhật thông tin tài khoản của bạn</Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdate}
                    initialValues={{
                        name: currentUser?.name || "",
                        username: currentUser?.username || "",
                        password: "",
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

                    <Divider />

                    <Form.Item>
                        <Space>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading}
                                icon={<SaveOutlined />}
                            >
                                Cập nhật thông tin
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
