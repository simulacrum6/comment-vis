package awkwardrobots.tests;

import awkwardrobots.data.Comment;
import awkwardrobots.util.MockCommentProvider;
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

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
