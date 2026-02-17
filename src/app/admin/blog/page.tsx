import { prisma } from "@/lib/prisma";
import { AdminBlogClient } from "@/components/admin/AdminBlogClient";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <h1 className="mb-4 text-lg font-semibold text-slate-800 sm:mb-6 sm:text-xl">
        Блог
      </h1>
      <AdminBlogClient initialPosts={posts} />
    </>
  );
}
