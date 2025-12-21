package lol.dest4590.agario2.handlers;

import com.fasterxml.jackson.databind.ObjectMapper;
import lol.dest4590.agario2.models.Food;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.ArrayList;

import static lol.dest4590.agario2.configs.WebSocketConfig.sessions;
import static lol.dest4590.agario2.handlers.PlayerHandler.sendPlayerUpdates;
import static lol.dest4590.agario2.util.PosUtil.distance;

public class FoodHandler extends TextWebSocketHandler {
    private final ArrayList<Food> foodList = new ArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(foodList)));
        } catch (Exception e) {
            System.out.println("Error sending food list: " + e.getMessage());
        }
    }

    @Scheduled(fixedRate = 100)
    public void spawnFood() {
        int world = 1000;

        int x = (int) (Math.random() * world) - world / 2;
        int y = (int) (Math.random() * world) - world / 2;

        Food newFood = new Food(x, y, 10);
        foodList.add(newFood);
    }


    @Scheduled(fixedRate = 100)
    public void processFoodCollisions() {
        sessions.forEach((session, player) -> {
            foodList.removeIf(food -> {
                double d = distance(food.getX(), food.getY(), player.getX(), player.getY());
                if (d < player.getRadius()) {
                    player.setRadius(player.getRadius() + food.getSize() / 5);
                    sendPlayerUpdates();
                    return true;
                }
                return false;
            });
        });
    }
}
