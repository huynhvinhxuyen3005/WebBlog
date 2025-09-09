import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { Button, Layout, Menu, Avatar, Dropdown, Space, Typography, Badge, ConfigProvider, App as AntApp } from "antd";
import {
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    PlusOutlined,
    HomeOutlined,
    EditOutlined
} from "@ant-design/icons";
import { getUserFromLocalStorage } from "./components/utils/auth";
import Home from "./components/pages/Home";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import CreatePost from "./components/pages/CreatePost";
import EditPost from "./components/pages/EditPost";
import PostDetail from "./components/Posts/PostDetail";
import Profile from "./components/User/Profile";
import AdminDashboard from "./components/Admin/AdminDashboard";

const { Header, Content } = Layout;
const { Text } = Typography;

function App() {
    const [currentUser, setCurrentUser] = useState(getUserFromLocalStorage());

    const handleLogout = () => {
        localStorage.removeItem("user");
        setCurrentUser(null);
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: <Link to="/profile">Thông tin cá nhân</Link>,
        },
        {
            key: 'create',
            icon: <PlusOutlined />,
            label: <Link to="/create">Tạo bài viết</Link>,
        },
        ...(currentUser && currentUser.role === 'admin' ? [{
            key: 'admin',
            icon: <SettingOutlined />,
            label: <Link to="/admin">Quản trị</Link>,
        }] : []),
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout,
        },
    ];

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1890ff',
                },
            }}
        >
            <AntApp>
                <Router>
                    <Layout style={{ minHeight: '100vh', background: '#ffffff' }}>
                <Header
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        padding: '0 24px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        borderBottom: '1px solid #34495e'
                    }}
                >

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'white',
                                fontSize: '20px',
                                fontWeight: 'bold'
                            }}>
                                <HomeOutlined style={{ fontSize: '24px' }} />
                                <span>Blog Của Xuyên</span>
                            </div>
                        </Link>

                        <Menu
                            theme="dark"
                            mode="horizontal"
                            selectable={false}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white'
                            }}
                            items={[
                                {
                                    label: <Link to="/" style={{ color: 'white' }}>Trang chủ</Link>,
                                    key: "home",
                                    icon: <HomeOutlined />
                                },
                                ...(currentUser ? [
                                    {
                                        label: <Link to="/create" style={{ color: 'white' }}>Tạo bài viết</Link>,
                                        key: "create",
                                        icon: <PlusOutlined />
                                    }
                                ] : [])
                            ]}
                        />
                    </div>


                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {currentUser ? (
                            <Dropdown
                                menu={{ items: userMenuItems }}
                                placement="bottomRight"
                                arrow
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    padding: '8px 16px',
                                    borderRadius: '24px',
                                    background: 'rgba(255,255,255,0.1)',
                                    transition: 'all 0.3s ease',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}
                                     onMouseEnter={(e) => {
                                         e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                                     }}
                                     onMouseLeave={(e) => {
                                         e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                     }}
                                >
                                    <Badge count={0} size="small">
                                        <Avatar
                                            size={36}
                                            src={currentUser.avatar || null}
                                            style={{
                                                backgroundColor: currentUser.role === 'admin' ? '#ff4d4f' : '#3498db',
                                                border: '2px solid rgba(255,255,255,0.3)'
                                            }}
                                        >
                                            {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                                        </Avatar>
                                    </Badge>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#ecf0f1', lineHeight: '1.2' }}>
                                            {currentUser.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#bdc3c7', lineHeight: '1.2' }}>
                                            @{currentUser.username}
                                        </div>
                                    </div>
                                </div>
                            </Dropdown>
                        ) : (
                            <Space>
                                <Link to="/login">
                                    <Button
                                        type="text"
                                        style={{
                                            color: '#ecf0f1',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            borderRadius: '6px'
                                        }}
                                    >
                                        Đăng nhập
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button
                                        type="primary"
                                        style={{
                                            background: '#3498db',
                                            color: 'white',
                                            border: 'none',
                                            fontWeight: '500',
                                            borderRadius: '6px'
                                        }}
                                    >
                                        Đăng ký
                                    </Button>
                                </Link>
                            </Space>
                        )}
                    </div>
                </Header>

                                 <Content style={{
                     padding: "24px",
                     background: '#ffffff',
                     minHeight: 'calc(100vh - 64px)'
                 }}>
                    <Routes>
                        <Route path="/" element={<Home currentUser={currentUser} />} />
                        <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
                        <Route path="/register" element={<Register setCurrentUser={setCurrentUser} />} />
                        <Route
                            path="/create"
                            element={currentUser ? <CreatePost currentUser={currentUser} /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/edit/:id"
                            element={currentUser ? <EditPost currentUser={currentUser} /> : <Navigate to="/login" />}
                        />
                        <Route path="/post/:id" element={<PostDetail currentUser={currentUser} />} />
                        <Route
                            path="/profile"
                            element={currentUser ? <Profile currentUser={currentUser} setCurrentUser={setCurrentUser} /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/admin"
                            element={currentUser && currentUser.role === "admin" ? <AdminDashboard currentUser={currentUser} /> : <Navigate to="/" />}
                        />
                    </Routes>
                </Content>
            </Layout>
        </Router>
            </AntApp>
        </ConfigProvider>
    );
}

export default App;