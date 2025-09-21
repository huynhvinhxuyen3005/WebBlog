import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { Button, Layout, Avatar, Dropdown, Space, Badge, ConfigProvider, App as AntApp } from "antd";
import {
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    HomeOutlined
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
function App() {
    const [currentUser, setCurrentUser] = useState(getUserFromLocalStorage());
    const handleLogout = () => {
        localStorage.removeItem("user");
        setCurrentUser(null);
    };

    const userMenuItems = [
        {
            key: 'header',
            type: 'group',
            label: (
                <div style={{
                    padding: '16px 20px 12px 20px',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    marginBottom: '8px',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar
                            size={44}
                            src={currentUser?.avatar || null}
                            style={{
                                background: currentUser?.role === 'admin' 
                                    ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' 
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: '3px solid #fff',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                        >
                            {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
                        </Avatar>
                        <div>
                            <div style={{ 
                                fontSize: '16px', 
                                fontWeight: '700', 
                                color: '#2c3e50',
                                lineHeight: '1.2',
                                marginBottom: '2px'
                            }}>
                                {currentUser?.name}
                            </div>
                            <div style={{ 
                                fontSize: '13px', 
                                color: '#6c757d',
                                lineHeight: '1.2',
                                fontWeight: '500'
                            }}>
                                @{currentUser?.username}
                            </div>
                            {currentUser?.role === 'admin' && (
                                <div style={{
                                    display: 'inline-block',
                                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                                    color: 'white',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    marginTop: '4px',
                                    boxShadow: '0 2px 4px rgba(255,107,107,0.3)'
                                }}>
                                    👑 ADMIN
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'profile',
            icon: <UserOutlined style={{ color: '#667eea', fontSize: '16px' }} />,
            label: (
                <Link to="/profile" style={{ 
                    color: '#2c3e50', 
                    fontWeight: '500',
                    fontSize: '14px',
                    textDecoration: 'none'
                }}>
                    👤 Thông tin cá nhân
                </Link>
            ),
            style: {
                padding: '12px 20px',
                borderRadius: '8px',
                margin: '4px 12px',
                transition: 'all 0.3s ease',
                background: 'transparent'
            }
        },
        ...(currentUser && currentUser.role === 'admin' ? [{
            key: 'admin',
            icon: <SettingOutlined style={{ color: '#fa8c16', fontSize: '16px' }} />,
            label: (
                <Link to="/admin" style={{ 
                    color: '#2c3e50', 
                    fontWeight: '500',
                    fontSize: '14px',
                    textDecoration: 'none'
                }}>
                    ⚙️ Quản trị
                </Link>
            ),
            style: {
                padding: '12px 20px',
                borderRadius: '8px',
                margin: '4px 12px',
                transition: 'all 0.3s ease',
                background: 'transparent'
            }
        }] : []),
        {
            type: 'divider',
            style: {
                margin: '8px 0',
                borderColor: 'rgba(0,0,0,0.08)'
            }
        },
        {
            key: 'logout',
            icon: <LogoutOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />,
            label: (
                <span style={{ 
                    color: '#ff4d4f', 
                    fontWeight: '500',
                    fontSize: '14px'
                }}>
                    🚪 Đăng xuất
                </span>
            ),
            onClick: handleLogout,
            style: {
                padding: '12px 20px',
                borderRadius: '8px',
                margin: '4px 12px',
                transition: 'all 0.3s ease',
                background: 'transparent'
            }
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
                                color: 'white',
                                fontSize: '20px',
                                fontWeight: 'bold'
                            }}>
                                <span>Blog Của Xuyên</span>
                            </div>
                        </Link>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Link to="/" style={{ textDecoration: 'none' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: 'white',
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    transition: 'all 0.3s ease',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                                >
                                    <HomeOutlined style={{ fontSize: '16px' }} />
                                    <span>Trang chủ</span>
                                </div>
                            </Link>
                        </div>
                    </div>


                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {currentUser ? (
                            <Dropdown
                                menu={{ 
                                    items: userMenuItems,
                                    style: {
                                        borderRadius: '16px',
                                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                        border: 'none',
                                        background: 'rgba(255,255,255,0.98)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '8px 0',
                                        minWidth: '300px',
                                        overflow: 'hidden'
                                    }
                                }}
                                placement="bottomRight"
                                arrow={false}
                                overlayStyle={{
                                    borderRadius: '16px',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    padding: '8px 16px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.15)',
                                    transition: 'all 0.3s ease',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                                     onMouseEnter={(e) => {
                                         e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                                         e.currentTarget.style.transform = 'translateY(-2px)';
                                         e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                                     }}
                                     onMouseLeave={(e) => {
                                         e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                                         e.currentTarget.style.transform = 'translateY(0)';
                                         e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                     }}
                                >
                                    <Badge count={0} size="small">
                                        <Avatar
                                            size={40}
                                            src={currentUser.avatar || null}
                                            style={{
                                                background: currentUser.role === 'admin' 
                                                    ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' 
                                                    : 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                                border: '3px solid rgba(255,255,255,0.4)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                                        </Avatar>
                                    </Badge>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <div style={{ 
                                            fontSize: '15px', 
                                            fontWeight: '700', 
                                            color: 'white', 
                                            lineHeight: '1.2',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                        }}>
                                            {currentUser.name}
                                        </div>
                                        <div style={{ 
                                            fontSize: '12px', 
                                            color: 'rgba(255,255,255,0.8)', 
                                            lineHeight: '1.2',
                                            fontWeight: '500'
                                        }}>
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