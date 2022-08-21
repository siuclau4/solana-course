import { Idl } from "@project-serum/anchor";

export type CrowdFunding = {
  version: "0.1.0";
  name: "crowd_funding";
  instructions: [
    {
      name: "create";
      accounts: [
        {
          name: "campaign";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "user";
          isMut: true;
          isSigner: true;
        }
      ];
      args: [
        {
          name: "name";
          type: "string";
        },
        {
          name: "description";
          type: "string";
        }
      ];
    },
    {
      name: "withdraw";
      accounts: [
        {
          name: "campaign";
          isMut: true;
          isSigner: false;
        },
        {
          name: "user";
          isMut: true;
          isSigner: true;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "donate";
      accounts: [
        {
          name: "campaign";
          isMut: true;
          isSigner: false;
        },
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "campaign";
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            type: "string";
          },
          {
            name: "description";
            type: "string";
          },
          {
            name: "accountDonated";
            type: "u64";
          },
          {
            name: "admin";
            type: "publicKey";
          }
        ];
      };
    }
  ];
};

export const IDL: CrowdFunding = {
  version: "0.1.0",
  name: "crowd_funding",
  instructions: [
    {
      name: "create",
      accounts: [
        {
          name: "campaign",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "description",
          type: "string",
        },
      ],
    },
    {
      name: "withdraw",
      accounts: [
        {
          name: "campaign",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "donate",
      accounts: [
        {
          name: "campaign",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "campaign",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "description",
            type: "string",
          },
          {
            name: "accountDonated",
            type: "u64",
          },
          {
            name: "admin",
            type: "publicKey",
          },
        ],
      },
    },
  ],
};
