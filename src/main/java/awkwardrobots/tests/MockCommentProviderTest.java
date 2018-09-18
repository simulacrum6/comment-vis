package awkwardrobots.tests;

import awkwardrobots.data.Comment;
import awkwardrobots.util.MockCommentProvider;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class MockCommentProviderTest {

    private final int maxAmount = 1000;
    private Comment[] comments;

    @Test
    public void testReadValidAmount() {
        int validAmount = 10;
        comments = MockCommentProvider.getComments(validAmount);
        assertEquals(validAmount, comments.length);
    }

    @Test
    public void testReadTooLowAmount() {
        int weirdAmount = -4151;
        assertThrows(IllegalArgumentException.class, () -> MockCommentProvider.getComments(weirdAmount));
    }

    @Test
    public void testReadTooHighAmount() {
        int tooMuch = 9001;
        comments = MockCommentProvider.getComments(tooMuch);
        assertEquals(maxAmount, comments.length);
    }

    @Test
    public void testCommentContent() {
        comments = MockCommentProvider.getComments(maxAmount);
        for (Comment comment : comments)
            assertNotNull(comment);
    }
}
