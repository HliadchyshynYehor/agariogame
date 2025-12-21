package lol.dest4590.agario2.models;

import java.util.Random;

public enum Color {
    RED, GREEN, BLUE, YELLOW, ORANGE, PURPLE, PINK, CYAN, MAGENTA, TEAL, BROWN, BLACK, WHITE, GRAY;

    public static Color getRandomColor() {
        Color[] colors = values();
        Random random = new Random();
        return colors[random.nextInt(0, colors.length)];
    }

    public String getHex() {
        return switch (this) {
            case RED -> "#FF0000";
            case GREEN -> "#00FF00";
            case BLUE -> "#0000FF";
            case YELLOW -> "#FFFF00";
            case ORANGE -> "#FFA500";
            case PURPLE -> "#800080";
            case PINK -> "#FFC0CB";
            case CYAN -> "#00FFFF";
            case MAGENTA -> "#FF00FF";
            case TEAL -> "#008080";
            case BROWN -> "#A52A2A";
            case BLACK -> "#000000";
            case WHITE -> "#FFFFFF";
            case GRAY -> "#808080";
        };
    }

}
