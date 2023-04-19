import { join } from "path"
import { promises as fs } from "fs"
import { exec } from "child_process"

import { config } from "dotenv";
import { Configuration, OpenAIApi } from "openai"

const projectDir = "/Users/linusbolls/projects/test"

const prompt = `Pretend you are an experienced web development developer with expertise in Typescript.

You have build a tik tac toe app in the command line.

you have three actions available to interact with me and set up everything you need:

exec: [command]
    where [command] is a valid bash command: execute the command
    example: "exec: ls -a"
put [filename]: [content]
    overwrite the file with content
    example: "put src/index.ts: console.log('test')"
append [filename]: [content]
    appends the file with the content
    example: "append src/index.ts: console.log('test')"

I want you to return nothing else but these commands. This includes the whole typescript code. No comments just this.

You sent your good developer nothing but a copy and paste of this terminal.
Don't say anything else but the code and the bash commands. I don't wanna here your thought process or anything else but the code and commands you would put into the terminal.
It's crucial that you for example put the echo shell command before any code so it is directly put into a file.
Never forget you are interacting with a terminal and it is important that everything you do is translated into shell commands.

Also don't start your answer with something like "Sure, here's the code and bash commands for setting up a tic-tac-toe game in the command line using  TypeScript:" Just answer with the terminal content.
`

config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// async function main() {

//     try {

//         const censoredApiKey = Array.from(process.env.OPENAI_API_KEY!).map(i => "*").join("")

//         console.info(`openai api key is '${censoredApiKey}'`)

//         const completion = await openai.createCompletion({
//             model: "text-davinci-003",
//             prompt,
//         });
//         const bowserCommand = completion.data.choices[0].text!

//         console.info(bowserCommand);

//         await enactPrompt(bowserCommand)

//     } catch (err) {
//         console.error("error occured:", err.message)
//     }
// }
// main()

async function executeCommand(command: string): Promise<readonly [any, null] | readonly [null, string]> {

    return new Promise(res => {

        try {
            exec(command, (error, stdout, stderr) => {

                if (error) {
                    res([error, null] as const)
                }
                if (stderr) {
                    res([stderr, null] as const)
                }
                res([null, stdout] as const)
            });
        } catch (err) {
            res([err, null] as const)
        }
    })
}

async function enactPrompt(prompt: string) {

    const commands = prompt.split("\n")

    for (const command of commands) {

        const [cmd, ...detailParts] = command.split(": ")

        const detail = detailParts.join(": ")

        const [verb, ...args] = cmd.split(" ")

        console.info("  " + cmd)

        switch (verb) {

            case "exec":

                const [error, data] = await executeCommand(`cd ${projectDir} && ${detail}`)

                console.info("    output:", data)

                break;

            case "put":

                await fs.writeFile(join(projectDir, args[0]), detail.replace(/^\"+|\"+$/g, '\n'))

                break;

                

            case "append":

                await fs.writeFile(join(projectDir, args[0]), detail.replace(/^\"+|\"+$/g, '\n'), { flag: 'a+' })

                break;
        }
    }
}
const test1 = `put package.json: {"name": "tic-tac-toe", "version": "1.0.0", "description": "", "main": "index.ts", "scripts": {"start": "tsc && node index.js"}, "dependencies": {"@types/node": "^16.11.7", "readline-sync": "^1.4.10"}, "devDependencies": {"typescript": "^4.5.5"}}
exec: npm install
put tsconfig.json: {"compilerOptions": {"target": "es6", "module": "commonjs", "strict": true, "esModuleInterop": true}}
put index.ts: echo "import readlineSync from 'readline-sync'; const board = ['', '', '', '', '', '', '', '', '']; let currentPlayer = 'X'; while (true) { console.log(Current player: \$\{currentPlayer\}); const index = readlineSync.questionInt('Enter the index (0-8): '); if (board[index] !== '') { console.log('Invalid move, try again!'); continue; } board[index] = currentPlayer; console.log(\${board[0]} | \${board[1]} | \${board[2]}); console.log(---+---+---); console.log(\${board[3]} | \${board[4]} | \${board[5]}); console.log(---+---+---); console.log(\${board[6]} | \${board[7]} | \${board[8]}); if (checkWin()) { console.log(\${currentPlayer} wins!); break; } if (checkDraw()) { console.log(It's a draw!); break; } currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; } function checkWin() { return (board[0] === currentPlayer && board[1] === currentPlayer && board[2] === currentPlayer) || (board[3] === currentPlayer && board[4] === currentPlayer && board[5] === currentPlayer) || (board[6] === currentPlayer && board[7] === currentPlayer && board[8] === currentPlayer) || (board[0] === currentPlayer && board[3] === currentPlayer && board[6] === currentPlayer) || (board[1] === currentPlayer && board[4] === currentPlayer && board[7] === currentPlayer) || (board[2] === currentPlayer && board[5] === currentPlayer && board[8] === currentPlayer) || (board[0] === currentPlayer && board[4] === currentPlayer && board[8] === currentPlayer) || (board[2] === currentPlayer && board[4] === currentPlayer && board[6] === currentPlayer); } function checkDraw() { return !board.includes(''); }" > index.ts
exec: npm start`

const test2 = `exec: mkdir src

put src/index.ts: ""

append src/index.ts: "class TicTacToe {"
append src/index.ts: "  board: string[][];"
append src/index.ts: "  currentPlayer: string;"
append src/index.ts: "  constructor() {"
append src/index.ts: "    this.board = Array(3).fill(null).map(() => Array(3).fill(' '));"
append src/index.ts: "    this.currentPlayer = 'X';"
append src/index.ts: "  }"
append src/index.ts: "  markCell(row: number, col: number): void {"
append src/index.ts: "    if (this.board[row][col] !== ' ' || this.hasWinner()) return;"
append src/index.ts: "    this.board[row][col] = this.currentPlayer;"
append src/index.ts: "    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';"
append src/index.ts: "  }"
append src/index.ts: "  hasWinner(): boolean {"
append src/index.ts: "    const winConditions = ["
append src/index.ts: "      // Rows"
append src/index.ts: "      [[0, 0], [0, 1], [0, 2]],"
append src/index.ts: "      [[1, 0], [1, 1], [1, 2]],"
append src/index.ts: "      [[2, 0], [2, 1], [2, 2]],"
append src/index.ts: "      // Columns"
append src/index.ts: "      [[0, 0], [1, 0], [2, 0]],"
append src/index.ts: "      [[0, 1], [1, 1], [2, 1]],"
append src/index.ts: "      [[0, 2], [1, 2], [2, 2]],"
append src/index.ts: "      // Diagonals"
append src/index.ts: "      [[0, 0], [1, 1], [2, 2]],"
append src/index.ts: "      [[0, 2], [1, 1], [2, 0]],"
append src/index.ts: "    ];"
append src/index.ts: "    return winConditions.some(condition => {"
append src/index.ts: "      const [a, b, c] = condition.map(coords => this.board[coords[0]][coords[1]]);"
append src/index.ts: "      return a !== ' ' && a === b && b === c;"
append src/index.ts: "    });"
append src/index.ts: "  }"
append src/index.ts: "  displayBoard(): void {"
append src/index.ts: "    console.log(this.board.map(row => row.join('|')).join('\n-+-+-\n'));"
append src/index.ts: "  }"
append src/index.ts: "}"
append src/index.ts: "const game = new TicTacToe();"
append src/index.ts: "const stdin = process.stdin;"
append src/index.ts: "stdin.setEncoding('utf8');"
append src/index.ts: "console.clear();"
append src/index.ts: "game.displayBoard();"
append src/index.ts: "const prompt = (): void => {"
append src/index.ts: "  stdin.resume();"
append src/index.ts: "  console.log(\`Player \${game.currentPlayer}, make your move. Type [row],[column] and press ENTER:\`);"
append src/index.ts: "};"
append src/index.ts: "stdin.on('data', (input: string) => {"
append src/index.ts: "  const [row, col] = input.trim().split(',').map(x => parseInt(x, 10));"
append src/index.ts: "  if (row < 0 || row > 2 || col < 0 || col > 2) {"
append src/index.ts: "    console.log('Invalid input. Please enter coordinates within the 3x3 grid.');"
append src/index.ts: "    return prompt();"
append src/index.ts: "  }"
append src/index.ts: "  game.markCell(row, col);"
append src/index.ts: "  console.clear();"
append src/index.ts: "  game.displayBoard();"
append src/index.ts: "  if (game.hasWinner()) {"
append src/index.ts: "    console.log(\`Player \${game.currentPlayer === 'X' ? 'O' : 'X'} wins!\`);"
append src/index.ts: "    stdin.pause();"
append src/index.ts: "  } else {"
append src/index.ts: "    prompt();"
append src/index.ts: "  }"
append src/index.ts: "});"
append src/index.ts: "prompt();"

exec: npm init -y
exec: npm install -g typescript
exec: tsc --init
exec: tsc
exec: node src/index.js`

enactPrompt(test2)