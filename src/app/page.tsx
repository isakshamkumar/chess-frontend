"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-300">
              Welcome to Shatranj
            </h1>
            <h2 className="text-2xl lg:text-3xl text-gray-300 mb-8">
              The World&apos;s Premier Online Chess Experience
            </h2>
            <p className="text-lg text-gray-400 mb-10">
              Immerse yourself in the ancient game of kings. Join millions of players worldwide and experience chess like never before. Whether you&apos;re a novice or a grandmaster, Shatranj offers a journey for every player.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/play/online" className="inline-block bg-amber-500 text-gray-900 font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-amber-400 transition duration-300 ease-in-out">
                Start Your Journey
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative w-full h-96 lg:h-[500px]">
              <Image
                src="/chess.jpg"
                alt="Shatranj chess board"
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow-2xl"
              />
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute -bottom-10 -left-10 bg-gray-800 p-6 rounded-lg shadow-xl"
            >
              <p className="text-2xl font-semibold mb-2">Join Now</p>
              <p className="text-gray-400">1M+ active players</p>
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-20 text-center"
        >
          <h3 className="text-3xl font-bold mb-8">Why Choose Shatranj?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Play Anytime", desc: "24/7 matchmaking with players worldwide" },
              { title: "Learn & Improve", desc: "Extensive tutorials and AI analysis" },
              { title: "Compete", desc: "Regular tournaments and leaderboards" }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h4 className="text-xl font-semibold mb-4">{feature.title}</h4>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}