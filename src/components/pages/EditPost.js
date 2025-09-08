import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Form, Input, Select, App, Space, Divider, } from "antd";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { 
    BoldOutlined, 
    ItalicOutlined, 
    UnderlineOutlined, 
    OrderedListOutlined, 
    UnorderedListOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "../style/EditPost.css";

export default function EditPost({ currentUser }) {
    const { message, notification } = App.useApp();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [initialContent, setInitialContent] = useState("");
    const [post, setPost] = useState(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: "Nhập nội dung bài viết..." })
        ],
        content: initialContent
    });
    useEffect(() => {
        axios.get(`http://localhost:9999/posts/${id}`).then((res) => {
            const postData = res.data;
            setPost(postData);
            
            if (postData.authorId !== currentUser.id && currentUser.role !== "admin") {
                message.error("Bạn không có quyền chỉnh sửa bài viết này!");
                navigate("/");
                return;
            }
            
            form.setFieldsValue({
                title: postData.title,
                visibility: postData.visibility
            });
            setInitialContent(postData.content);
            if (editor) {
                editor.commands.setContent(postData.content);
            }
        }).catch(() => {
            message.error("Không tìm thấy bài viết!");
            navigate("/");
        });
    }, [id, form, editor, currentUser.id, navigate]);

    const handleSubmit = async (values) => {
        if (!editor || editor.getText().trim() === "") {
            message.error("Nội dung không được để trống!");
            return;
        }

        setLoading(true);
        const updatedPost = {
            ...post,
            title: values.title,
            content: editor.getHTML(),
            visibility: values.visibility,
        };

        try {
            await axios.put(`http://localhost:9999/posts/${id}`, updatedPost);
            notification.success({
                message: "✅ Cập nhật bài viết thành công!",
                description: "Bài viết của bạn đã được cập nhật thành công.",
                duration: 3,
                placement: 'topRight',
                style: {
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
            });
            navigate("/");
        } catch (error) {
            message.error("Lỗi khi cập nhật bài viết!");
        } finally {
            setLoading(false);
        }
    };

    if (!editor || !post) {
        return <div>Đang tải...</div>;
    }

    return (
        <div className="edit-post-container">
            <Card 
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => navigate('/')}
                            type="text"
                        />
                        <span style={{ fontSize: '18px', fontWeight: '600' }}>
                            ✏️ Chỉnh sửa bài viết
                        </span>
                    </div>
                }
                style={{ 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderRadius: '12px'
                }}
            >
                <Form layout="vertical" form={form} onFinish={handleSubmit}>
                    <Form.Item
                        label={
                            <span style={{ fontWeight: '500', fontSize: '16px' }}>
                                📝 Tiêu đề bài viết
                            </span>
                        }
                        name="title"
                        rules={[
                            { required: true, message: "Vui lòng nhập tiêu đề!" },
                            { min: 5, message: "Tiêu đề phải có ít nhất 5 ký tự!" }
                        ]}
                    >
                        <Input 
                            placeholder="Nhập tiêu đề bài viết" 
                            size="large"
                            style={{ borderRadius: '8px' }}
                        />
                    </Form.Item>

                    <Form.Item 
                        label={
                            <span style={{ fontWeight: '500', fontSize: '16px' }}>
                                📄 Nội dung bài viết
                            </span>
                        }
                    >
                        <div className="editor-wrapper">
                            <div className="editor-toolbar">
                                <Space>
                                    <Button
                                        type={editor.isActive('bold') ? 'primary' : 'default'}
                                        icon={<BoldOutlined />}
                                        onClick={() => editor.chain().focus().toggleBold().run()}
                                        size="small"
                                        title="In đậm (Ctrl+B)"
                                    />
                                    <Button
                                        type={editor.isActive('italic') ? 'primary' : 'default'}
                                        icon={<ItalicOutlined />}
                                        onClick={() => editor.chain().focus().toggleItalic().run()}
                                        size="small"
                                        title="In nghiêng (Ctrl+I)"
                                    />
                                    <Button
                                        type={editor.isActive('underline') ? 'primary' : 'default'}
                                        icon={<UnderlineOutlined />}
                                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                                        size="small"
                                        title="Gạch chân (Ctrl+U)"
                                    />
                                    <Divider type="vertical" />
                                    <Button
                                        type={editor.isActive('bulletList') ? 'primary' : 'default'}
                                        icon={<UnorderedListOutlined />}
                                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                                        size="small"
                                        title="Danh sách không đánh số"
                                    />
                                    <Button
                                        type={editor.isActive('orderedList') ? 'primary' : 'default'}
                                        icon={<OrderedListOutlined />}
                                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                        size="small"
                                        title="Danh sách đánh số"
                                    />
                                </Space>
                            </div>
                            
                            <div className="editor-content">
                                <EditorContent editor={editor} />
                            </div>
                        </div>
                    </Form.Item>

                    <Form.Item 
                        label={
                            <span style={{ fontWeight: '500', fontSize: '16px' }}>
                                🔒 Chế độ hiển thị
                            </span>
                        }
                        name="visibility"
                    >
                        <Select
                            options={[
                                { 
                                    label: "🌍 Công khai - Mọi người có thể xem", 
                                    value: "public" 
                                },
                                { 
                                    label: "🔐 Riêng tư - Chỉ bạn có thể xem", 
                                    value: "private" 
                                }
                            ]}
                            style={{ borderRadius: '8px' }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space size="large">
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading}
                                icon={<SaveOutlined />}
                                size="large"
                                style={{ 
                                    borderRadius: '8px',
                                    height: '48px',
                                    padding: '0 32px',
                                    fontSize: '16px',
                                    fontWeight: '500'
                                }}
                            >
                                {loading ? 'Đang cập nhật...' : '💾 Cập nhật'}
                            </Button>
                            <Button 
                                onClick={() => navigate('/')}
                                size="large"
                                style={{ 
                                    borderRadius: '8px',
                                    height: '48px',
                                    padding: '0 32px',
                                    fontSize: '16px'
                                }}
                            >
                                ❌ Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}