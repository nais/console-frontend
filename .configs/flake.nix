{
  description = "Console Frontend development environment";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs =
    inputs:
    inputs.flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import inputs.nixpkgs { localSystem = { inherit system; }; };
      in
      {
        devShells.default = pkgs.mkShellNoCC {
          packages = with pkgs; [
            mise
            kubernetes-helm
          ];
        };
      }
    );
}
