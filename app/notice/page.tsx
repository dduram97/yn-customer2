import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공지사항",
  description: "영남수산 공지사항",
};

export default function NoticePage() {
  return (
    <div className="py-8 text-center">
      <p className="text-[16px] text-body">등록된 공지사항이 없습니다.</p>
    </div>
  );
}
