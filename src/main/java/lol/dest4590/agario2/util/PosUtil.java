package lol.dest4590.agario2.util;

public class PosUtil {
    public static double distance(int x1, int y1, int x2, int y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    public static boolean isTouching(int x1, int y1, int x2, int y2, int distance) {
        double dist = distance(x1, y1, x2, y2);
        return dist < distance;
    }
}
