"use client";
import React, { useEffect, useState } from "react";
import { Chess } from "chess.js";
import './page.css'
import { useRouter } from "next/navigation";
import Image from "next/image";

const Init_Game = "startGame";
const Start_Game = "gameBegins";
const Move = "move";
const PIECE_CLICK = "pieceClick";
const CHECK = "check";
const NOT_CHECK = "notCheck"
const CheckMate = "checkMate"
const ERROR = "error"
const GAMEEXIT = "gameExit"

type Moves = {
  from: string;
  to: string;
  captured?: string | null
}

const Page = () => {
  enum BoardColorVariant {
    REGULAR = "regular",
    WOODEN = "wooden",
  }

  const [boardColorVariant, setBoardColorVariant] = useState<BoardColorVariant>(BoardColorVariant.REGULAR);
  const [chess, setChess] = useState(new Chess());
  const [player1_name, setplayer1_name] = useState<string>("");
  const [player2_name, setplayer2_name] = useState<string>("");
  const [Check, setCheck] = useState<boolean>(false);
  const [playerColor, setPlayerColor] = useState<string>("");
  const player1_nameRef = React.createRef<HTMLInputElement>();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [moves, setmoves] = useState<Moves[]>([]);
  const [chessBoard, setChessBoard] = useState(chess.board());
  const [waiting, setwaiting] = useState(false);
  const [showMoves, setShowMoves] = useState(false);
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [availableMoves, setAvailableMoves] = useState<string[] | null>(null);
  const [currentTurn, setCurrentTurn] = useState<'w' | 'b'>('w');

  const router = useRouter();

  function checkKingPositionAndCheckMate(playerColor: string): {
    rowIndex: number | null;
    squareIndex: number | null;
  } {
    let kingPosition: { rowIndex: number | null; squareIndex: number | null } =
      { rowIndex: null, squareIndex: null };
    const board = chess.board();

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j]?.type === "k" && board[i][j]?.color === playerColor) {
          const king_square = board[i][j]?.square;
          const ascii = 97; // ASCII value for 'a'
          const aplhabet = king_square?.split("")[0];
          const number = king_square?.split("")[1];
          const rowIndex = 8 - Number(number);
          //@ts-ignore
          const squareIndex = aplhabet?.charCodeAt(0) - ascii;
          kingPosition = { rowIndex, squareIndex };
          break;
        }
      }
    }

    return kingPosition;
  }

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/");
    setWs(ws);

    ws.onopen = () => {
      console.log("connected to ws server");
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case Start_Game:
          setwaiting(false);
          setplayer1_name(data.player1_name);
          setplayer2_name(data.player2_name);
          setPlayerColor(data.player_color);
          setShowMoves(true);
          break;
        case Move:
          chess.move(data.move);
          setmoves(prev => [...prev, { from: data.move.from, to: data.move.to, captured: data.captured }]);
          setChessBoard(chess.board());
          setCurrentTurn(chess.turn() as 'w' | 'b');
          break;
        case PIECE_CLICK:
          setAvailableMoves(data.availableMoves);
          break;
        case CHECK:
          setCheck(data.check);
          break;
        case CheckMate:
          alert(`Game Over! ${data.player_won}`);
          break;
        case ERROR:
          setFrom(null);
          setTo(null);
          alert(`Error: ${data.message}`);
          break;
        case GAMEEXIT:
          router.push("/");
          break;
      }
    };
  }, [chess, router]);

  const convertAvailableMovesToSquareIndices = (availableMoves: string[]) => {
    const alphabets = availableMoves.map((move) => {
      const ascii = 97;
      const rowIndex = 8 - Number(move.split("")[1]);
      const squareIndex = Number(move.split("")[0].charCodeAt(0) - ascii);
      return { rowIndex, squareIndex };
    });
    return alphabets;
  };

  const toggleMoves = () => {
    setwaiting(true);
    ws?.send(
      JSON.stringify({
        type: Init_Game,
        player_name: player1_nameRef.current?.value,
      })
    );
  };

  const handlePieceClick = (
    square: any,
    rowIndex: number,
    squareIndex: number
  ) => {
    const audio = new Audio("/move-self.mp3");
    
    // Convert the clicked position to the actual board position
    const actualRow = playerColor === 'b' ? 7 - rowIndex : rowIndex;
    const actualCol = playerColor === 'b' ? 7 - squareIndex : squareIndex;

    const file = String.fromCharCode(97 + actualCol);
    const rank = 8 - actualRow;
    const squareName = `${file}${rank}`;

    if (square !== null && square.square !== null) {
      if (from) {
        setAvailableMoves(null);
        setTo(squareName);
        audio.play();

        try {
          ws?.send(
            JSON.stringify({
              type: Move,
              position: { from, to: squareName },
            })
          );
        } catch (error) {
          console.log(error, "error");
        }
        setFrom(null);
        setTo(null);
      } else {
        setFrom(squareName);
        ws?.send(
          JSON.stringify({ type: PIECE_CLICK, position: squareName })
        );
      }
    } else {
      if (from) {
        setTo(squareName);
        audio.play();
        ws?.send(
          JSON.stringify({ type: Move, position: { from, to: squareName } })
        );
        setFrom(null);
        setTo(null);
        setAvailableMoves(null);
      } else {
        setFrom(squareName);
        setAvailableMoves(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <header className="bg-gray-700 p-6">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-300">Shatranj</h1>
        </header>
        <div className="p-8">
          {playerColor && <p className="text-center text-xl font-medium text-gray-300 mb-6">Your Color: {playerColor}</p>}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
            <div className="w-full lg:w-2/3">
              {showMoves && (
                <div className="flex justify-between mb-4">
                  <div className="text-2xl font-bold text-gray-200">{playerColor === 'w' ? player2_name : player1_name}</div>
                  <div className="text-2xl font-mono bg-gray-700 px-4 py-2 rounded">10:00</div>
                </div>
              )}
              <div className="grid grid-cols-8 gap-0.5 bg-gray-600 p-1 rounded-lg">
                {(playerColor === 'b' ? [...chessBoard].reverse() : chessBoard).map((row, rowIndex) => (
                  <React.Fragment key={rowIndex}>
                    {(playerColor === 'b' ? [...row].reverse() : row).map((square, squareIndex) => {
                      const kingRow = checkKingPositionAndCheckMate(playerColor).rowIndex;
                      const kingCol = checkKingPositionAndCheckMate(playerColor).squareIndex;
                      const isCheck = Check && kingRow === rowIndex && kingCol === squareIndex;
                      const isAvailableMove = availableMoves &&
                        convertAvailableMovesToSquareIndices(availableMoves).some(
                          (move) => move.rowIndex === (playerColor === 'b' ? 7 - rowIndex : rowIndex) && 
                                    move.squareIndex === (playerColor === 'b' ? 7 - squareIndex : squareIndex)
                        );

                      return (
                        <div
                          key={squareIndex}
                          onClick={() => handlePieceClick(square, rowIndex, squareIndex)}
                          className={`
                            h-24 w-24 flex items-center justify-center relative
                            ${
                              (rowIndex + squareIndex) % 2 === 0
                                ? boardColorVariant === BoardColorVariant.REGULAR ? 'bg-customWhite' : 'wooden-light-bg'
                                : boardColorVariant === BoardColorVariant.REGULAR ? 'bg-customGreen' : 'wooden-dark-bg'
                            }
                            ${isAvailableMove ? 'after:content-[""] after:absolute after:w-3 after:h-3 after:bg-green-500 after:rounded-full after:opacity-75' : ''}
                            ${isCheck ? 'bg-red-600' : ''}
                          `}
                        >
                          <Piece piece={{ type: square?.type!, color: square?.color! }} />
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
              {showMoves && (
                <div className="flex justify-between mt-4">
                  <div className="text-2xl font-bold text-gray-200">{playerColor === 'w' ? player1_name : player2_name}</div>
                  <div className="text-2xl font-mono bg-gray-700 px-4 py-2 rounded">10:00</div>
                </div>
              )}
            </div>

            <div className="w-full lg:w-1/3 space-y-8">
              <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-200">Game Status</h2>
                {playerColor && (
                  <div className="mb-4">
                    <p className="text-xl font-medium text-gray-300">Your Color: 
                      <span className={`ml-2 font-bold ${playerColor === 'w' ? 'text-amber-200' : 'text-gray-800'}`}>
                        {playerColor === 'w' ? 'White' : 'Black'}
                      </span>
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xl font-medium text-gray-300">Current Turn:</p>
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full mr-2 ${currentTurn === 'w' ? 'bg-amber-200' : 'bg-gray-800'}`}></div>
                    <span className={`text-xl font-bold ${currentTurn === 'w' ? 'text-amber-200' : 'text-gray-800'}`}>
                      {currentTurn === 'w' ? 'White' : 'Black'}
                    </span>
                  </div>
                </div>
              </div>

              {!showMoves ? (
                <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
                  <input
                    ref={player1_nameRef}
                    type="text"
                    placeholder="Enter Your name"
                    className="w-full p-3 mb-4 bg-gray-600 text-white border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded transition duration-300"
                    onClick={toggleMoves}
                  >
                    Play Now
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
                    <button
                      onClick={() => ws?.send(JSON.stringify({ type: GAMEEXIT }))}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded transition duration-300"
                    >
                      Resign
                    </button>
                  </div>
                  <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-gray-200">Board Variant</h3>
                    <button
                      onClick={() => setBoardColorVariant(BoardColorVariant.WOODEN)}
                      className="w-full mb-3 bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 px-4 rounded transition duration-300"
                    >
                      Wooden
                    </button>
                    <button
                      onClick={() => setBoardColorVariant(BoardColorVariant.REGULAR)}
                      className="w-full bg-green-700 hover:bg-green-900 text-white font-bold py-3 px-4 rounded transition duration-300"
                    >
                      Regular
                    </button>
                  </div>
                </>
              )}
              {waiting && 
                <div className="text-center text-xl text-gray-400 animate-pulse p-4 bg-gray-700 rounded-lg">
                  Waiting for the other player to join...
                </div>
              }
              {!waiting && showMoves && <MovesTable moves={moves} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Piece = ({ piece }: { piece: { type: string; color?: string } }) => {
  const imageSource =
    piece.color &&
    (piece.color === "w" ? `/${piece.type}w.png` : `/${piece.type}b.png`);

  return (
    <>
      {imageSource ? (
        <Image
          className="h-5/6 w-5/6"
          height={48}
          width={48}
          src={imageSource}
          alt="chess piece"
        />
      ) : null}
    </>
  );
};

const MovesTable = ({ moves }: { moves: Moves[] }) => {
  return (
    <div className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
      <h3 className="text-xl font-bold p-4 bg-gray-600 text-gray-200">Moves History</h3>
      <div className="max-h-96 overflow-y-auto move-table-overflow">
        <table className="w-full">
          <thead className="bg-gray-600 text-gray-200">
            <tr>
              <th className="py-2 px-4 text-left">From</th>
              <th className="py-2 px-4 text-left">To</th>
              <th className="py-2 px-4 text-left">Captured</th>
            </tr>
          </thead>
          <tbody>
            {moves.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-400">
                  No Moves Yet
                </td>
              </tr>
            )}
            {moves.length > 0 && moves.map((move, index) => (
              <tr key={index} className="border-b border-gray-600 hover:bg-gray-600">
                <td className="py-2 px-4 text-sm text-gray-300">{move.from}</td>
                <td className="py-2 px-4 text-sm text-gray-300">{move.to}</td>
                <td className="py-2 px-4 text-sm text-gray-300">
                  {move.captured ? (
                    <Image
                      src={`/${move.captured}${move.captured === move.captured.toUpperCase() ? 'b' : 'w'}.png`}
                      alt={`Captured ${move.captured}`}
                      width={20}
                      height={20}
                    />
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;