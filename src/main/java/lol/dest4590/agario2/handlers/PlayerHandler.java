package lol.dest4590.agario2.handlers;

import com.fasterxml.jackson.databind.ObjectMapper;
import lol.dest4590.agario2.models.Color;
import lol.dest4590.agario2.models.Input;
import lol.dest4590.agario2.models.Player;
import lol.dest4590.agario2.util.PlayerUtil;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;

import static lol.dest4590.agario2.configs.WebSocketConfig.sessions;

public class PlayerHandler extends TextWebSocketHandler {
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Player newPlayer = new Player(session.getId(), 0, 0, 10, "Player" + session.getId().substring(0, 5), Color.getRandomColor().getHex(), new Input(), 0);

        sessions.put(session, newPlayer);
        System.out.println("New connection established: " + session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        System.out.println("Connection closed: " + session.getId());
        sessions.remove(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            Input input = objectMapper.readValue(message.getPayload(), Input.class);
            Player player = sessions.get(session);
            if (player != null) {
                player.setInput(input);
            }
        } catch (IOException e) {
            System.out.println("Error parsing message: " + e.getMessage());
        }
    }

    public static void sendPlayerUpdates() {
        sessions.forEach((session, player) -> {
            try {
                session.sendMessage(new TextMessage(player.sizeUpdateMessage()));
            } catch (IOException e) {
                System.out.println("Error sending message: " + e.getMessage());
            }
        });
    }

    @Scheduled(fixedRate = 100)
    public void broadcastPlayerUpdates() {
        sessions.values().forEach(player -> {
            PlayerUtil.processInput(player);
            PlayerUtil.processWeightLose(player);
            PlayerUtil.processCollisions(player);
        });

        ObjectMapper objectMapper = new ObjectMapper();
        sessions.forEach((session, player) -> {
            try {
                List<Player> allPlayersInfo = sessions.values().stream().toList();

                String playerJson = objectMapper.writeValueAsString(allPlayersInfo);
                session.sendMessage(new TextMessage(playerJson));
            } catch (IOException e) {
                System.out.println("Error sending message to session " + session.getId() + ": " + e.getMessage());
            }
        });
    }
}
