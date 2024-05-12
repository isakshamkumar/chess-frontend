import Image from "next/image";
import Link from "next/link";
export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-center py-12 px-4 lg:px-0">
      <div className="lg:border-r-2 border-gray-200">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-200 mb-4">Welcome To Shatranj.com</h1>
          <h3 className="text-xl lg:text-2xl text-slate-400 mb-6">The World&apos; #2 Online Chess Platform</h3>
          <p className="text-lg text-gray-500 mb-8">Join millions of players worldwide and experience the thrill of chess like never before. Whether you&apos;re a beginner or a grandmaster, Chess.com offers something for everyone.</p>
          <Link href="/play/online" className="inline-block bg-green-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out">Get Started</Link>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <div className="relative  w-full h-72 lg:h-auto lg:w-auto">
          <Image
            src="/chess.jpg"
            alt="chess logo"
       
            height={600}
            width={600}
            objectFit="contain"
            objectPosition="center"
          />
        </div>
      </div>
    </div>
  );
}
