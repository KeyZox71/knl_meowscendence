{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs =
    inputs@{ nixpkgs, ... }:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forEachSupportedSystem =
        f:
        nixpkgs.lib.genAttrs supportedSystems (
          system:
          f {
            pkgs = import nixpkgs { inherit system; };
          }
        );
    in
    {
      devShells = forEachSupportedSystem (
        { pkgs }:
        {
          default = pkgs.mkShell.override { } {
            buildInputs = with pkgs; [

            ];
            packages = with pkgs; [
              nixd
              nixfmt-rfc-style

              solc
              vscode-solidity-server
              typescript-language-server
              nodejs_22
              pnpm
              just
              foundry
            ];
            shellHook = ''
              				if [ ! -d node_modules/ ]; then
              					echo Installing node env
              					pnpm install
              				fi
              				if [ ! -d lib/ ]; then
              					echo Installing foundry env
								        forge i
              				fi
							alias jarvis=just
              				export PATH+=:$(pwd)/node_modules/.bin
                            	echo entering ft_trans env
            '';
          };
        }
      );
    };
}
