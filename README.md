# goimport-intellisense README

Visual Studio Code plugin to autocomplete _import declaration_.

This extension searches directories in `GOPATH/src/**`.

## Usage

1. set `"go.gopath"` configuration to your settings.
```json
{
    "go.gopath": "<your GOPATH>"
}
```

2. show suggestions by typing double quotation(`"`) or slash(`/`) then autocomplete by tab{`\t`).


## Known Issues

- not support to a completion of standard library (e.g. `fmt`).
- not support a format `import "<package name>"`.
- ignore packages that its name does not match its directory path.
- no validation to prevent a path string to go up to parent folder.
- inefficient algorithm to detect whether written line match as import declaration format or not.
- and too many issues to fix.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.1.0

add tiny functions to autocomplete.

## License

MIT License