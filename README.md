# goimport-intellisense README

Visual Studio Code plugin to autocomplete _import declaration_.

This extension searches directories in `GOPATH/src/**`.

## Usage

1. set `"go.gopath"` and `'go.goroot'`configuration to your settings.
```json
{
    "go.gopath": "<your GOPATH>",
    "go.goroot": "<your GOROOT>"
}
```

2. show suggestions by typing double quotation(`"`) or slash(`/`) then autocomplete by tab{`\t`).


## Known Issues

- not support a format `import "<package name>"`.
- ignore packages that its name does not match its directory path.
- no validation to prevent a path string to go up to parent folder using reletive path format.
- inefficient algorithm to detect whether written line match as import declaration format or not.
- and too many issues to fix.

## Release Notes

### 0.2.0

- enable to autocomplete standard libraries when `"go.goroot"` configuration exists.

## License

MIT License