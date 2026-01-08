import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "./_components/navbar";

const Home = () => {
  const { userId } = auth();
  if (!userId) {
    redirect("/login");
  }
  return (
    <>
      <Navbar />
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
    </>
  );
};

export default Home;
