{
  description = "A Nix-flake-based Rust development environment";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs";
  };

  outputs = {
    self,
    flake-utils,
    nixpkgs,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {
        inherit system;
        overlays = [];
      };
    in {
      checks = {
        # inherit
        #   ;
      };
      devShells.default = pkgs.mkShell {
        nativeBuildInputs =
          (with pkgs; [
            # Editor stuffs
            helix
            elmPackages.elm-language-server
          ])
          ++ [
            # Packages made in this flake
          ];

        shellHook = ''
        '';
      };
      packages = {
        # rust = cargo-package;
        # docker = pkgs.dockerTools.buildImage {
        #   name = binary-name;
        #   tag = "v${cargo-details.package.version}";
        #   extraCommands = ''mkdir -p data'';
        #   config = {
        #     Cmd = "--help";
        #     Entrypoint = ["${cargo-package}/bin/${binary-name}"];
        #   };
        # };
      };
      packages.default = pkgs.cowsay;

      # Now `nix fmt` works!
      formatter = pkgs.alejandra;
    });
}
