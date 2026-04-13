import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Mail, Phone, UserRound } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { teachersService } from '../../../services/teachers';
import { usersService } from '../../../services/users';
import { toast } from 'sonner';

export default function TeacherContactPage() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState<any>(null);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    teachersService.getTeacher(id).then((res) => setTeacher(res.data)).catch(() => setTeacher(null));
    usersService.getMe().then((res) => {
      setSenderName(res.data.full_name || res.data.username || '');
      setSenderEmail(res.data.email || '');
    }).catch(() => {});
  }, [id]);

  const submit = async () => {
    if (!id || !senderName || !senderEmail || !message) return;
    setSubmitting(true);
    try {
      await teachersService.contactTeacher(id, {
        sender_name: senderName,
        sender_email: senderEmail,
        message,
      });
      toast.success('Đã gửi liên hệ');
      setMessage('');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Không thể gửi liên hệ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link to={`/teachers/${id}`} className="inline-flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Quay lại hồ sơ giảng viên
      </Link>

      <Card className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <UserRound className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Liên hệ giảng viên</h1>
        </div>
        <p className="text-gray-600 mb-2">
          {teacher ? `Bạn đang gửi liên hệ tới ${teacher.name}.` : 'Gửi liên hệ tới giảng viên.'}
        </p>
        {teacher && <p className="text-sm text-gray-500 mb-8">{teacher.email} • {teacher.phone}</p>}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Tên của bạn</Label>
            <Input id="name" className="mt-2" placeholder="Nguyễn Văn A" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="email" className="pl-10" placeholder="example@email.com" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} />
            </div>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="message">Tin nhắn</Label>
            <Textarea id="message" className="mt-2" rows={6} placeholder="Nội dung liên hệ..." value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={submit} disabled={!senderName || !senderEmail || !message || submitting} className="flex-1">Gửi liên hệ</Button>
          <Button variant="outline" disabled className="flex-1">
            <Phone className="w-4 h-4 mr-2" />
            Tạo lịch hẹn
          </Button>
        </div>
      </Card>
    </div>
  );
}
