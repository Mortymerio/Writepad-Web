export const hashData = [
  {
    name: "MD5",
    regex: /^[a-fA-F0-9]{32}$/,
    mode: 0,
    example: "8743b52063cd84097a65d1633f5c74f5"
  },
  {
    name: "NTLM",
    regex: /^[a-fA-F0-9]{32}$/,
    mode: 1000,
    example: "b4b9b02e6f09a9bd760f388b67351e2b",
    note: "Shares length with MD5. In a Windows AD context, it's almost certainly NTLM."
  },
  {
    name: "SHA-1",
    regex: /^[a-fA-F0-9]{40}$/,
    mode: 100,
    example: "b89eaac7e61417341b710b727768294d0e6a277b"
  },
  {
    name: "SHA-256",
    regex: /^[a-fA-F0-9]{64}$/,
    mode: 1400,
    example: "127e6fbfe24a750e72930c220a8e138275656b8e5d8f48a98c3c92df2caba935"
  },
  {
    name: "SHA-512",
    regex: /^[a-fA-F0-9]{128}$/,
    mode: 1700,
    example: "82a9dda829eb7f8ffe9fbe49e45d47d2dad9664fbb7adf72492e3c81ebd3e29134d9bc12212bf83c6840f10e8246ab1440a3e8d8ee3468579471de9996e1cc8"
  },
  {
    name: "bcrypt (Blowfish)",
    regex: /^\$2[aby]\$[0-9]{2}\$[a-zA-Z0-9\.\/]{53}$/,
    mode: 3200,
    example: "$2a$12$R9h/cIPz0gi.URNNX3rub2D9te.RzsWuT7Oq/m06C4p5x1s18a7w."
  }
];
