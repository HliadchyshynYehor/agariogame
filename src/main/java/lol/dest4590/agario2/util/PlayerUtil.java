package lol.dest4590.agario2.util;

import lol.dest4590.agario2.models.Input;
import lol.dest4590.agario2.models.Player;
import org.springframework.web.socket.WebSocketSession;

import java.util.Objects;

import static lol.dest4590.agario2.configs.WebSocketConfig.sessions;
import static lol.dest4590.agario2.handlers.PlayerHandler.sendPlayerUpdates;

public class PlayerUtil {
    public static void processInput(Player player) {
        Input input = player.getInput();
        if (input == null) return;

        player.setX(player.getX() + (input.getXAxis() != null ? input.getXAxis() : 0));
        player.setY(player.getY() + (input.getYAxis() != null ? input.getYAxis() : 0));
    }


    public static void processWeightLose(Player player) {
        player.setWeightLoseTick(player.getWeightLoseTick() + 1);

        if (player.getWeightLoseTick() >= 500 && player.getRadius() > 10 && player.isPlayerMoving()) {
            player.setRadius(player.getRadius() - 1);
            sendPlayerUpdates();
            player.setWeightLoseTick(0);
        }
    }

    private static WebSocketSession getSessionByPlayer(Player player) {
        for (WebSocketSession session : sessions.keySet()) {
            if (sessions.get(session).getId().equals(player.getId())) {
                return session;
            }
        }
        return null;
    }

    public static void killPlayer(Player player) {
        try {
            Objects.requireNonNull(getSessionByPlayer(player)).close();
        } catch (Exception e) {
            System.out.println("Error killing player: " + e.getMessage());
        }
    }

    public static void processCollisions(Player player) {
        for (Player other : sessions.values()) {
            if (other.getId().equals(player.getId())) continue;

            if (player.isCollidingWith(other)) {
                if (player.getRadius() > other.getRadius() * 1.1) {
                    player.setRadius(player.getRadius() + other.getRadius() / 5);
                    other.setRadius(Math.max(10, other.getRadius() - other.getRadius() / 5));
                    PlayerUtil.killPlayer(other);
                    sendPlayerUpdates();
                }
            }
        }
    }
}
