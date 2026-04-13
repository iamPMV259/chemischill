import { Link } from 'react-router';
import { ArrowLeft, MessageCircleWarning, ShieldAlert } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const zaloUrl = import.meta.env.VITE_ADMIN_ZALO_URL || '';
const zaloLabel = import.meta.env.VITE_ADMIN_ZALO_LABEL || 'Admin ChemisChill';

export default function ForgotPasswordPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/login" className="inline-flex items-center gap-2 text-gray-600 mb-8 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Quay lại đăng nhập
      </Link>

      <Card className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <ShieldAlert className="w-8 h-8 text-orange-600" />
          <h1 className="text-3xl font-bold">Quên mật khẩu</h1>
        </div>
        <p className="text-gray-600 mb-8">
          Nếu bạn quên mật khẩu, vui lòng nhắn tin cho admin qua Zalo để được hỗ trợ. Sau khi xác minh tài khoản, chúng tôi sẽ cung cấp cho bạn mật khẩu mới.
        </p>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <MessageCircleWarning className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Cách lấy lại mật khẩu</p>
              <p className="text-sm text-blue-800 mt-1">
                Nhắn Zalo cho admin, cung cấp email hoặc username của tài khoản. Admin sẽ kiểm tra và gửi lại mật khẩu mới cho bạn.
              </p>
            </div>
          </div>

          {zaloUrl ? (
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <a href={zaloUrl} target="_blank" rel="noreferrer">
                Liên hệ admin qua Zalo
              </a>
            </Button>
          ) : (
            <div className="rounded-lg border border-dashed border-blue-300 bg-white p-4 text-sm text-gray-700">
              Cấu hình thêm `VITE_ADMIN_ZALO_URL` để hiện nút liên hệ trực tiếp qua Zalo.
              <div className="mt-2 font-medium">{zaloLabel}</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
