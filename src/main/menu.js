
import { Menu } from "electron";

export function createMenu(){
    const template = [
        {
            label: "App Demo",
            submenu: [
                {
                    role: "about"
                },
                {
                    role: "quit"
                }
            ]
        }
    ];
    let menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}