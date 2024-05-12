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
const NOT_CHECK="notCheck"
const CheckMate="checkMate"
const ERROR="error"
const GAMEEXIT="gameExit"
const Page = () => {
  enum BoardColorVariant{
    REGULAR="regular",
    WOODEN="wooden",
  }

const[boardColorVariant,setBoardColorVariant]=useState<BoardColorVariant>(BoardColorVariant.REGULAR);
  const [chess, setChess] = useState(new Chess());
  const [player1_name, setplayer1_name] = useState<string>("");
  const [player2_name, setplayer2_name] = useState<string>("");
  const [Check, setCheck] = useState<boolean>(false);
  const [playerColor, setPlayerColor] = useState<string>("");
  const player1_nameRef = React.createRef<HTMLInputElement>();
  const [ws, setWs] = useState<WebSocket | null>(null);

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
  type Moves={
    from: string;
    to: string;
    captured?:string| null
  }
  const [moves, setmoves] = useState<
  Moves[]
>([]);


  useEffect(() => {
  
    const ws = new WebSocket("wss://chess-ws.onrender.com/");
    setWs(ws);

    ws.onopen = () => {
      console.log("connected to ws server");
    };
    ws.onmessage = (event) => {


      if (JSON.parse(event.data).type === Start_Game) {
        setwaiting(false);
 
        setplayer1_name(JSON.parse(event.data).player1_name);
        setplayer2_name(JSON.parse(event.data).player2_name);
alert(JSON.parse(event.data).player_color)
        setPlayerColor(JSON.parse(event.data).player_color);
        setShowMoves(true);
      }
      if (JSON.parse(event.data).type === Move) {
        //console.log(data.move,'move');
        chess.move(JSON.parse(event.data).move);
        // console.log(moves, "movesssssssssssssssssssssssssssss");
// alert(JSON.parse(event.data).captured)
// alert(JSON.parse(event.data).turn)
        setmoves(prev=>[...prev,{from:JSON.parse(event.data).move.from,to:JSON.parse(event.data).move.to,captured:JSON.parse(event.data).captured}]);
        // console.log(...moves, '...moves');
        
  //  console.log(JSON.parse(event.data).move,'JSON PARSE MOVE');
   
        // console.log(chess.board());

        setChessBoard(chess.board());
      }
      if (JSON.parse(event.data).type === PIECE_CLICK) {
        // mapAvailableMovesToSquares(JSON.parse(event.data).availableMoves);
        setAvailableMoves(JSON.parse(event.data).availableMoves);
        // console.log(mapAvailableMovesToSquares(JSON.parse(event.data).availableMoves),'mapAvailableMovesToSquares');
        // console.log(
        //   convertAvailableMovesToSquareIndices(
        //     JSON.parse(event.data).availableMoves
        //   ),
        //   "convertAvailableMovesToSquareIndices"
        // );
      }
      if (JSON.parse(event.data).type === CHECK) {
        
        setCheck(JSON.parse(event.data).check);
      }
      if(JSON.parse(event.data).type===CheckMate){
        alert(`Game Over! ${JSON.parse(event.data).player_won}`)
      }
      if(JSON.parse(event.data).type===ERROR){
        setFrom(null)
        setTo(null)
        alert(`Error: ${JSON.parse(event.data).message}`)
      }
      if(JSON.parse(event.data).type===GAMEEXIT){
        router.push("/")
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chess]);
  const mapAvailableMovesToSquares = (availableMoves: string[]) => {
    return availableMoves?.map((move) => {

      // console.log(availableMoves, "availableMoves");

      const ascii = 97; // ASCII value for 'a'

      const rowIndex = 8 - Number(move.split("")[1]) + 1;
      // rowArr.push(row)
      const squareIndex = move[0].charCodeAt(0) - ascii; 
      return { rowIndex, squareIndex };
    });
  };
  const [chessBoard, setChessBoard] = useState(chess.board());
  const [waiting, setwaiting] = useState(false);
  const [showMoves, setShowMoves] = useState(false);
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [availableMoves, setAvailableMoves] = useState<string[] | null>(null);

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
    // console.log(square, "sq");

    const audio = new Audio("/move-self.mp3");
    if (square !== null && square.square !== null) {
      if (from) {
        setAvailableMoves(null);
        setTo(square.square);
        //@ts-ignore
        audio.play();


        try {
          ws?.send(
            JSON.stringify({
              type: Move,
              position: { from, to: square.square },
            })
          );
          // console.log(chess.ascii(), "after move");
        } catch (error) {
          console.log(error, "error");
        }
        setFrom(null);
        setTo(null);
      } else {
        setFrom(square.square);
        ws?.send(
          JSON.stringify({ type: PIECE_CLICK, position: square.square })
        );


      }

    } else {

    

      const ascii = 97;
      const letter = String.fromCharCode(ascii + squareIndex);
      const number = 8 - rowIndex;
      console.log(letter, number, "letter and number");
      const newSquare = letter + number;
      console.log(newSquare, "newSquare");
      if (from) {
      
        setTo(newSquare);

        

        audio.play();

        ws?.send(
          JSON.stringify({ type: Move, position: { from, to: newSquare } })
        );
    

        setFrom(null);
        setTo(null);
        setAvailableMoves(null);
      } else {
        setFrom(newSquare);
        setAvailableMoves(null);
      
      }
    }
  }; //
  const convertAvailableMovesToSquareIndices = (availableMoves: string[]) => {

    const alphabets = availableMoves.map((move) => {
      const ascii = 97;

      const rowIndex = 8 - Number(move.split("")[1]);

      const squareIndex = Number(move.split("")[0].charCodeAt(0) - ascii);
      return { rowIndex, squareIndex };
    });
    return alphabets;
  };
  const router=useRouter()
  return (
    <div className=" px-24 ">
       {playerColor && <p className="text-center  font-medium text-white">Your Color {playerColor}</p> }
      {showMoves && (
        <div className="w-[45%] flex justify-between">

        <div className="  text-white  text-3xl ">
          <h4>{player1_name}</h4>
         
        </div>
        <div className="text-white text-3xl">10:00</div>
        </div>
      )}
      <div className="flex  h-[80vh]  w-fit justify-center items-center mt-2 ">
        <div className={`flex flex-col mr-8  `}>
          {chessBoard.map((row, rowIndex) => (
            <div className="flex w-full  justify-start  items-center  m-0 p-0" key={rowIndex}>
              {row.map((square, squareIndex) => {
                const kingRow =
                  checkKingPositionAndCheckMate(playerColor).rowIndex;
                const kingCol =
                  checkKingPositionAndCheckMate(playerColor).squareIndex;
                const isCheck =
                  Check && kingRow === rowIndex && kingCol === squareIndex;
                const isAvailableMove =
                  availableMoves &&
                  convertAvailableMovesToSquareIndices(availableMoves).some(
                    (move) =>
                      move.rowIndex === rowIndex &&
                      move.squareIndex === squareIndex
                  );

                return (
                  <div
                  onClick={() => handlePieceClick(square, rowIndex, squareIndex)}
                  className={`
                       h-24 w-24 m-0 p-0  flex items-center justify-center text-white
                      ${
                          (rowIndex + squareIndex) % 2 === 0 && !isAvailableMove && boardColorVariant === BoardColorVariant.REGULAR
                              ? "bg-customWhite"
                              : (rowIndex + squareIndex) % 2 !== 0 && !isAvailableMove && boardColorVariant === BoardColorVariant.REGULAR
                              ? "bg-customGreen"
                              : (rowIndex + squareIndex) % 2 === 0 && isAvailableMove
                              ? "" // No background color for available moves
                              : ""
                      }
                      ${
                          isAvailableMove
                              ? `opacity-35  ${boardColorVariant===BoardColorVariant.REGULAR?'bg-customGreen shadow-2xl border-slate-300':'wooden-dark-bg border-gray-600-300 shadow-2xl'} `
                              : isCheck
                              ? "bg-red-600"
                              : ""
                      }
                      ${
                          (rowIndex + squareIndex) % 2 === 0 && !isAvailableMove && boardColorVariant === BoardColorVariant.WOODEN
                              ? "wooden-dark-bg"
                              : (rowIndex + squareIndex) % 2 !== 0 && !isAvailableMove && boardColorVariant === BoardColorVariant.WOODEN
                              ? "wooden-light-bg"
                              : ""
                      }
                  `}
                  key={squareIndex}
              >
                  <Piece piece={{ type: square?.type!, color: square?.color! }} />
              </div>
              
                );
              })}
            </div>
          ))}
        </div>



        {!waiting && showMoves && <MovesTable moves={moves} />}
                {!showMoves ? (
          <div className="relative">
            <input
              ref={player1_nameRef}
              type="text"
              placeholder="Enter Your name"
            />
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={toggleMoves}
            >
              Play Now
            </button>
          </div>
        )
         : (
          <div className=" h-[80vh] p-10 flex flex-col gap-6   ">
          <button onClick={()=>
            {
              ws?.send(
                JSON.stringify({ type: GAMEEXIT  })
              );
          
             
              
            }
              } className="bg-red-500 hover:bg-red-700 text-white font-extrabold text-2xl h-16 py-4 px-4 rounded">
            Quit Game
          </button>
          <div className="text-white font-bold mt-6 text-2xl">Change Board Variant</div>
          <button onClick={()=>setBoardColorVariant(BoardColorVariant.WOODEN)} style={{backgroundColor:'#825D37'}} className=" text-white opacity-80  hover:opacity-100 font-extrabold text-2xl h-16 py-4 px-4  rounded" >
             Wodden
          </button>
          <button onClick={()=>setBoardColorVariant(BoardColorVariant.REGULAR)} className="bg-green-700 hover:bg-green-900 text-white font-extrabold text-2xl h-fit py-4 px-4 rounded" >
           Regular
          </button>
          </div>
        )}
        { waiting && 
          <div className="text-center    left-0 text-white text-xl my-5">
            {" "}  Waiting for the other player to join...
          </div>
        }
    
      </div>
      {showMoves && (
        <div className="w-[45%] flex justify-between">

        <div className="  text-white  text-3xl ">
          {player2_name}
        </div>
        <div className="text-white text-3xl">10:00</div>
        </div>
      )}
    </div>
  );
};

const Piece = ({ piece }: { piece: { type: string; color?: string } }) => {
  const imageSource =
    piece.color &&
    (piece.color === "w" ? `/${piece.type}w.png` : `/${piece.type}b.png`);

  return <>{imageSource ? <Image className="h-3/5" height={20} width={60} src={imageSource} alt="chess pieces" /> : null}</>;
};

const MovesTable = ({ moves}:{moves:any}) => {
  return (
    <div className="ml-8  max-w-[30rem]  h-[80vh] flex  flex-col items-center rounded-2xl p-11 bg-transparent border border-slate-600" >
      <h2 className="text-3xl font-bold text-center text-white mb-2">Moves Table</h2>
      <table className="table-auto flex  w-96  flex-col mt-16 px-12 gap-6 max-h-[66vh] ">
        <thead className="w-full">
          <tr className="flex w-full   justify-between ">
            <th className="py-2 text-xl text-white">From</th>
            <th className=" py-2 text-xl text-white">To</th>
            <th className=" py-2 text-xl text-white">Captured</th>
          </tr>
        </thead>
        <tbody className="w-full max-h-[34rem] move-table-overflow overflow-y-auto  ">
          {moves.length===0 && <p className="text-white">No Moves.....</p>}
          {moves.length>0 && moves.map((move:any, index:number) => {
            return (
              <tr className="flex  w-full  justify-between " key={index}>
                <td className=" text-lg text-white py-2">{move.from}</td>
                <td className="text-lg  -ml-12  text-white py-2">{move.to}</td>
                <td className="  text-lg text-white py-2 mr-4">{move?.captured?move.captured:' nil'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
