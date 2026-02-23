# dotbuild

A cross-platform CLI utility that orchestrates dotnet project workflows. Run `clean`, `restore`, `build`, `run`, and `test` in a single command — actions are automatically sorted into the correct order and redundant steps are removed.

## Installation

```bash
npm install -g dotbuild
```

## Usage

Run from any directory containing a `.sln` or `.csproj` file.

```bash
# Run the default pipeline: clean → restore → test
dotbuild

# Run specific actions (in any order — they will be sorted automatically)
dotbuild clean
dotbuild restore build
dotbuild clean test build restore
```

### Available Actions

| Action    | Command          | Description                     |
|-----------|------------------|---------------------------------|
| `clean`   | `dotnet clean`   | Remove build artifacts          |
| `restore` | `dotnet restore` | Restore NuGet packages          |
| `build`   | `dotnet build`   | Compile the project             |
| `run`     | `dotnet run`     | Run the project                 |
| `test`    | `dotnet test`    | Run tests (also builds)         |

### Automatic Ordering

Actions are always executed in canonical order regardless of how they are passed:

**clean → restore → build → run → test**

```bash
# These are equivalent:
dotbuild clean restore build test
dotbuild test build restore clean
```

### Smart Optimization

Redundant steps are automatically removed:

- `test` already builds, so passing both `build` and `test` will only run `test`

```bash
# build is dropped because test already builds
dotbuild build test
# → runs: test

dotbuild clean test build restore
# → runs: clean → restore → test
```

### Fail-Fast Execution

Actions run sequentially. If any action fails, execution stops immediately — subsequent actions will not run.

```bash
dotbuild clean restore build
# If restore fails, build will not run
```

### Default Behavior

Running `dotbuild` with no arguments executes: **clean → restore → test**

(`build` is included in the default set but optimized away since `test` covers it.)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [.NET SDK](https://dotnet.microsoft.com/download)

## License

MIT
