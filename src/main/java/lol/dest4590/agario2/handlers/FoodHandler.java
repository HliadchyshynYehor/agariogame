package lol.dest4590.agario2.handlers;

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

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            session.sendMessage(new TextMessage(foodList.toString()));
        } catch (Exception e) {
            System.out.println("Error sending food list: " + e.getMessage());
        }
    }

    @Scheduled(fixedRate = 10000)
    public void spawnFood() {
        Food newFood = new Food((int) (Math.random() * 1000) - 500, (int) (Math.random() * 1000) - 500, 10);
        foodList.add(newFood);
    }

    @Scheduled(fixedRate = 100)
    public void processFoodCollisions() {
        sessions.forEach((session, player) -> {
            foodList.removeIf(food -> {
                double distance = distance(food.getX(), food.getY(), player.getX(), player.getY());
                if (distance < player.getRadius()) {
                    player.setRadius(player.getRadius() + food.getSize() / 5);
                    sendPlayerUpdates();
                    return true;
                }
                return false;
            });
        });
    }
}
