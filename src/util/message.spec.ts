import { parseMessage } from "./message";

describe("parseMessage", () => {
    it("detects default command", () => {
        expect(parseMessage(createMessage("!t"))).toStrictEqual({ command: "", args: [] });
        expect(parseMessage(createMessage("!tttt"))).toStrictEqual({ command: "", args: [] });
        expect(parseMessage(createMessage("  !t"))).toStrictEqual({ command: "", args: [] });
        expect(parseMessage(createMessage("!t   "))).toStrictEqual({ command: "", args: [] });
    });

    it("detects regular commands", () => {
        expect(parseMessage(createMessage("!t command"))).toStrictEqual({ command: "command", args: [] });
        expect(parseMessage(createMessage("!t     command    "))).toStrictEqual({ command: "command", args: [] });

        expect(parseMessage(createMessage("!t cmd arg1"))).toStrictEqual({ command: "cmd", args: ["arg1"] });
        expect(parseMessage(createMessage("!t cmd arg1 arg2"))).toStrictEqual({
            command: "cmd",
            args: ["arg1", "arg2"],
        });
    });

    it("detects unknown commands", () => {
        expect(parseMessage(createMessage("!test"))).toBeUndefined();
        expect(parseMessage(createMessage("!ttttt"))).toBeUndefined();
        expect(parseMessage(createMessage("!"))).toBeUndefined();
        expect(parseMessage(createMessage(""))).toBeUndefined();
    });
});

function createMessage(content: string) {
    return { content };
}
